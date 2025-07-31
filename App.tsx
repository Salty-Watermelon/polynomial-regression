
import React, { useState, useCallback } from 'react';
import { DataInput } from './components/DataInput';
import { Prediction } from './components/Prediction';
import { calculatePolynomialRegression, findBestFitPolynomial, evaluatePolynomial } from './services/regressionService';
import type { Point } from './types';

type View = 'input' | 'prediction';
export type AutoFitMethod = 'BIC' | 'AIC';

function App() {
  const [view, setView] = useState<View>('input');
  const [points, setPoints] = useState<Point[]>([]);
  const [coefficients, setCoefficients] = useState<number[]>([]);
  const [degree, setDegree] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoResult, setIsAutoResult] = useState(false);
  const [autoFitMethodResult, setAutoFitMethodResult] = useState<AutoFitMethod>('BIC');


  const handleTrain = async (data: string, selectedDegree: number, isAuto: boolean, autoFitMethod: AutoFitMethod) => {
    setIsLoading(true);
    setError(null);
    setIsAutoResult(isAuto);

    // Use a timeout to allow the UI to update to the loading state.
    await new Promise(resolve => setTimeout(resolve, 50)); 

    try {
      const parsedPoints: Point[] = data
        .trim()
        .split('\n')
        .map((line) => {
          const [x, y] = line.split(',').map(s => parseFloat(s.trim()));
          if (isNaN(x) || isNaN(y)) {
            throw new Error('Invalid data format. Each line must be "x,y".');
          }
          return { x, y };
        });

      let calculatedCoefficients: number[];
      let finalDegree: number;

      if (isAuto) {
        if (parsedPoints.length < 2) {
          throw new Error("Please provide at least 2 data points for auto mode.");
        }
        const result = findBestFitPolynomial(parsedPoints, autoFitMethod);
        calculatedCoefficients = result.coefficients;
        finalDegree = result.bestDegree;
        setAutoFitMethodResult(autoFitMethod);
      } else {
        if (parsedPoints.length < selectedDegree + 1) {
          throw new Error(`Please provide at least ${selectedDegree + 1} data points for a degree ${selectedDegree} polynomial.`);
        }
        calculatedCoefficients = calculatePolynomialRegression(parsedPoints, selectedDegree);
        finalDegree = selectedDegree;
      }
        
      setPoints(parsedPoints);
      setDegree(finalDegree);
      setCoefficients(calculatedCoefficients);
      
      setView('prediction');

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during calculation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('input');
    setPoints([]);
    setCoefficients([]);
    setError(null);
    setDegree(2);
    setIsAutoResult(false);
  };

  const discoveredFunc = useCallback((x: number): number => {
    if (coefficients.length === 0) return NaN;
    return evaluatePolynomial(coefficients, x);
  }, [coefficients]);


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-violet">
          Data-driven Function Finder
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          From Data Points to Predictive Models
        </p>
      </header>
      <main className="w-full max-w-4xl mx-auto">
        {view === 'input' ? (
          <DataInput onTrain={handleTrain} isLoading={isLoading} error={error} />
        ) : (
          <Prediction
            originalPoints={points}
            discoveredFunc={discoveredFunc}
            coefficients={coefficients}
            onReset={handleReset}
            degree={degree}
            isAutoResult={isAutoResult}
            autoFitMethodResult={autoFitMethodResult}
          />
        )}
      </main>
       <footer className="w-full max-w-4xl mx-auto text-center mt-8">
        <p className="text-slate-500 text-sm">
          Powered by React, Tailwind CSS, and a Local Regression Algorithm
        </p>
      </footer>
    </div>
  );
}

export default App;