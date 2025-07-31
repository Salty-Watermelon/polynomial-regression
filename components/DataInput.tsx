
import React, { useState } from 'react';
import type { AutoFitMethod } from '../App';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface DataInputProps {
  onTrain: (data: string, degree: number, isAuto: boolean, autoFitMethod: AutoFitMethod) => void;
  isLoading: boolean;
  error: string | null;
}

export const DataInput: React.FC<DataInputProps> = ({ onTrain, isLoading, error }) => {
  const [data, setData] = useState<string>('');
  const [degree, setDegree] = useState<number>(2);
  const [isAuto, setIsAuto] = useState<boolean>(true);
  const [autoFitMethod, setAutoFitMethod] = useState<AutoFitMethod>('AIC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim()) return; // Guard against empty submission
    onTrain(data, degree, isAuto, autoFitMethod);
  };

  const handleGenerateRandomData = () => {
    // 1. Determine complexity by choosing a number of roots (x-intercepts).
    const numRoots = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6 roots for a complex curve
    const xMin = -10;
    const xMax = 10;
    const xRange = xMax - xMin;

    // 2. Choose spread-out roots to guarantee a non-linear shape.
    // We divide the x-range into sections and pick one root per section.
    const roots: number[] = [];
    const sectionWidth = xRange / numRoots;
    for (let i = 0; i < numRoots; i++) {
        const sectionStart = xMin + i * sectionWidth;
        const root = sectionStart + Math.random() * sectionWidth;
        roots.push(root);
    }

    // 3. Define the polynomial based on the roots: f(x) = A * (x - r1) * (x - r2) * ...
    const secretPolynomialWithoutScaling = (x: number): number => {
        return roots.reduce((acc, root) => acc * (x - root), 1);
    };

    // Find the max value of the unscaled polynomial to determine the scaling factor.
    let maxAbsY = 0;
    for (let i = 0; i < 100; i++) {
        const testX = xMin + (xRange * i) / 99;
        const absY = Math.abs(secretPolynomialWithoutScaling(testX));
        if (absY > maxAbsY) {
            maxAbsY = absY;
        }
    }

    // Increase vertical range for more dispersion.
    const desiredYRange = 40 + Math.random() * 20; // Target y-range between 40 and 60.
    const scaleFactor = maxAbsY > 0 ? desiredYRange / maxAbsY : 1;
    
    const secretPolynomial = (x: number): number => {
        return secretPolynomialWithoutScaling(x) * scaleFactor;
    };

    // 4. Generate data points based on this polynomial, with added noise.
    const numPoints = Math.floor(Math.random() * 20) + 40; // 40 to 59 points.
    const points: {x: number; y: number}[] = [];

    // Increase noise magnitude for more dispersion.
    const noiseMagnitude = desiredYRange * 0.15; // 15% noise

    for (let i = 0; i < numPoints; i++) {
      const x = xMin + (Math.random() * xRange);
      const trueY = secretPolynomial(x);
      
      const noise = (Math.random() - 0.5) * 2 * noiseMagnitude;
      const finalY = trueY + noise;
      points.push({ x, y: finalY });
    }

    points.sort((a, b) => a.x - b.x);

    setData(points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join('\n'));
  };
  
  const FitMethodButton = ({ method, children }: { method: AutoFitMethod, children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setAutoFitMethod(method)}
      disabled={isLoading}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 w-1/2 ${
        autoFitMethod === method 
        ? 'bg-brand-cyan text-slate-900' 
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-2">
           <h2 className="text-xl font-semibold text-slate-100">1. Input Your Data</h2>
           <Button type="button" variant="secondary" onClick={handleGenerateRandomData} disabled={isLoading} className="px-3 py-1 text-sm">
             Generate Random
           </Button>
        </div>
        <p className="text-slate-400 mb-4">
          Enter (x,y) pairs, one per line, separated by a comma. You can also generate a random set.
        </p>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder={`1,2.1\n2,3.9\n3,6.2\n4,8.1\n5,9.8\n6,12.3\n7,14.2`}
          className="w-full h-48 p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-brand-cyan focus:outline-none transition-shadow duration-200 font-mono text-slate-200"
          disabled={isLoading}
          aria-label="Data points input"
        />
        
        <div className="mt-6 mb-2 flex items-center justify-between">
            <label className="block text-slate-300 font-medium">
                Polynomial Degree
            </label>
            <div className="flex items-center gap-2">
                <label htmlFor="auto-degree" className="text-sm font-semibold text-brand-cyan cursor-pointer">Auto</label>
                <input 
                    id="auto-degree"
                    type="checkbox"
                    checked={isAuto}
                    onChange={(e) => setIsAuto(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-brand-cyan focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-cyan cursor-pointer"
                    disabled={isLoading}
                />
            </div>
        </div>
        
        {isAuto && (
          <div className="mb-4 bg-slate-800 p-1 rounded-lg flex">
              <FitMethodButton method="BIC">Conservative (BIC)</FitMethodButton>
              <FitMethodButton method="AIC">Sensitive (AIC)</FitMethodButton>
          </div>
        )}

        <div className="mb-4 transition-opacity" style={{ opacity: isAuto ? 0.5 : 1 }}>
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-slate-400">Selected Degree:</span>
                <span className="font-bold text-slate-200">{degree}</span>
            </div>
            <input
                id="degree-slider"
                type="range"
                min="1"
                max="20"
                step="1"
                value={degree}
                onChange={(e) => setDegree(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:cursor-not-allowed"
                aria-label="Polynomial degree selector"
                disabled={isAuto || isLoading}
            />
        </div>


        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        <div className="mt-6 flex justify-center">
          <Button type="submit" disabled={isLoading || !data.trim()}>
            {isLoading ? (
              <>
                <Spinner />
                Calculating...
              </>
            ) : (
              'Generate Function'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
