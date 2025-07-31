import React from 'react';

interface PrettyFormulaProps {
  coefficients: number[];
  className?: string;
}

export const PrettyFormula: React.FC<PrettyFormulaProps> = ({ coefficients, className = '' }) => {
  if (!coefficients || coefficients.length === 0) {
    return <span className={className}>f(x) = 0</span>;
  }

  const parts: React.ReactNode[] = [];
  const reversedCoefficients = [...coefficients].reverse();
  const highestPower = reversedCoefficients.length - 1;

  reversedCoefficients.forEach((coeff, index) => {
    const power = highestPower - index;

    // Skip terms with a zero coefficient
    if (Math.abs(coeff) < 1e-9) {
      return;
    }

    const isFirstTerm = parts.length === 0;
    const absCoeff = Math.abs(coeff);

    // 1. Determine the sign
    if (!isFirstTerm) {
      parts.push(<span key={`sign-${power}`} className="mx-1">{coeff > 0 ? '+' : '-'}</span>);
    } else if (coeff < 0) {
      parts.push(<span key={`sign-${power}`} className="mr-1">-</span>);
    }

    // 2. Determine the coefficient's numeric value
    // Only show coefficient if it's not 1, or if it's the constant term (power 0)
    const showCoeff = Math.abs(absCoeff - 1) > 1e-9 || power === 0;
    if (showCoeff) {
       // A little formatting to keep it tidy
       const formattedCoeff = absCoeff > 1000 ? absCoeff.toExponential(2) : Number(absCoeff.toPrecision(3));
       parts.push(<span key={`coeff-${power}`}>{formattedCoeff}</span>);
    }

    // 3. Determine the variable 'x' and its exponent
    if (power > 0) {
       parts.push(<em key={`x-${power}`} className="font-serif italic">x</em>);
       if (power > 1) {
         parts.push(<sup key={`sup-${power}`}>{power}</sup>);
       }
    }
  });

  if (parts.length === 0) {
      return (
        <div className={`flex items-center justify-center ${className}`}>
            <em className="font-serif italic mr-2">f(x) =</em>
            <span>0</span>
        </div>
      );
  }

  return (
    <div className={`flex items-center justify-center flex-wrap ${className}`}>
        <em className="font-serif italic mr-2">f(x) =</em>
        {parts}
    </div>
  );
};
