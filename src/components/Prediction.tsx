
import React, { useState } from 'react';
import type { Point } from '../types';
import type { AutoFitMethod } from '../App';
import { Graph } from './Graph';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { PrettyFormula } from './common/PrettyFormula';

interface PredictionProps {
  originalPoints: Point[];
  discoveredFunc: (x: number) => number;
  coefficients: number[];
  onReset: () => void;
  degree: number;
  isAutoResult?: boolean;
  autoFitMethodResult?: AutoFitMethod;
}

export const Prediction: React.FC<PredictionProps> = ({
  originalPoints,
  discoveredFunc,
  coefficients,
  onReset,
  degree,
  isAutoResult,
  autoFitMethodResult,
}) => {
  const [xValue, setXValue] = useState<string>('');
  const [predictedY, setPredictedY] = useState<number | null>(null);

  const handlePredict = () => {
    const x = parseFloat(xValue);
    if (!isNaN(x)) {
      setPredictedY(discoveredFunc(x));
    } else {
      setPredictedY(null);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXValue(e.target.value);
    if(e.target.value === '') {
        setPredictedY(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <div className='flex justify-between items-start'>
            <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Calculated Function: Model Visualization</h2>
                <p className="text-slate-400 mb-4">
                  The calculated function that best fits your data points is visualized below.
                </p>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
                <span className="text-slate-400 text-sm">Polynomial Degree</span>
                <p className="font-bold text-2xl text-brand-cyan">{degree}</p>
                {isAutoResult && (
                  <p className="text-xs text-brand-cyan/80 -mt-1">
                    Auto-Selected ({autoFitMethodResult})
                  </p>
                )}
            </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-md mb-4 text-center min-h-[56px] flex items-center justify-center">
           <PrettyFormula coefficients={coefficients} className="text-xl text-brand-cyan" />
        </div>
        <div className="h-80 w-full">
          <Graph points={originalPoints} func={discoveredFunc} />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">2. Make a Prediction</h2>
        <p className="text-slate-400 mb-4">
          Use the calculated model to predict a 'y' value for a given 'x'.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            type="number"
            value={xValue}
            onChange={handleInputChange}
            placeholder="Enter a value for x"
            className="flex-grow"
            aria-label="Value for x"
          />
          <Button onClick={handlePredict} disabled={!xValue}>
            Predict 'y'
          </Button>
        </div>
        {predictedY !== null && !isNaN(predictedY) && (
            <div className="mt-6 text-center bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400">For x = <span className="font-bold text-white">{xValue}</span>,</p>
                <p className="text-3xl font-bold text-brand-cyan">{predictedY.toFixed(4)}</p>
                <p className="text-slate-400">is the predicted y-value.</p>
            </div>
        )}
      </Card>
      
      <div className="flex justify-center">
         <Button onClick={onReset} variant="secondary">
            Start Over
        </Button>
      </div>

    </div>
  );
};
