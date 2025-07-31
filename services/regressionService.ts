
import type { Point } from '../types';
import type { AutoFitMethod } from '../App';

/**
 * Solves a system of linear equations Ax = b using Gaussian elimination.
 * @param matrixA - The matrix A.
 * @param vectorB - The vector b.
 * @returns The solution vector x.
 */
function solveLinearSystem(matrixA: number[][], vectorB: number[]): number[] {
    const n = matrixA.length;
    const m = new Array(n);

    for (let i = 0; i < n; i++) {
        m[i] = [...matrixA[i], vectorB[i]];
    }

    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) {
                maxRow = k;
            }
        }
        [m[i], m[maxRow]] = [m[maxRow], m[i]]; // Swap rows

        if (Math.abs(m[i][i]) < 1e-10) {
            throw new Error("Matrix is singular. Cannot solve. Try a lower polynomial degree or different data.");
        }

        // Make pivot 1
        for (let k = i + 1; k < n + 1; k++) {
            m[i][k] /= m[i][i];
        }
        m[i][i] = 1;

        // Eliminate other rows
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = m[k][i];
                for (let j = i; j < n + 1; j++) {
                    m[k][j] -= factor * m[i][j];
                }
            }
        }
    }

    const solution = new Array(n);
    for (let i = 0; i < n; i++) {
        solution[i] = m[i][n];
    }
    return solution;
}


/**
 * Performs polynomial regression on a set of points.
 * @param points - The data points.
 * @param degree - The degree of the polynomial to fit.
 * @returns An array of coefficients [a0, a1, ..., an].
 */
export function calculatePolynomialRegression(points: Point[], degree: number): number[] {
    const n = degree + 1;
    const numPoints = points.length;

    const X: number[][] = [];
    for (let i = 0; i < numPoints; i++) {
        const row: number[] = [];
        for (let j = 0; j < n; j++) {
            row.push(Math.pow(points[i].x, j));
        }
        X.push(row);
    }
    
    const Y: number[] = points.map(p => p.y);
    
    const Xt: number[][] = [];
    for (let i = 0; i < n; i++) {
        Xt[i] = [];
        for (let j = 0; j < numPoints; j++) {
            Xt[i][j] = X[j][i];
        }
    }

    const XtX: number[][] = [];
    for (let i = 0; i < n; i++) {
        XtX[i] = [];
        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let k = 0; k < numPoints; k++) {
                sum += Xt[i][k] * X[k][j];
            }
            XtX[i][j] = sum;
        }
    }

    const XtY: number[] = [];
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < numPoints; j++) {
            sum += Xt[i][j] * Y[j];
        }
        XtY.push(sum);
    }

    const coefficients = solveLinearSystem(XtX, XtY);
    
    return coefficients;
}

/**
 * Evaluates a polynomial for a given x value using its coefficients.
 * @param coefficients - The array of coefficients [a0, a1, ..., an].
 * @param x - The value to evaluate.
 * @returns The result of the polynomial function.
 */
export function evaluatePolynomial(coefficients: number[], x: number): number {
    let result = 0;
    for (let i = 0; i < coefficients.length; i++) {
        result += coefficients[i] * Math.pow(x, i);
    }
    return result;
}

/**
 * Finds the best-fit polynomial by testing degrees and selecting the one with the lowest score.
 * @param points The data points.
 * @param method The criterion to use: 'BIC' (conservative) or 'AIC' (sensitive).
 * @returns An object with the best degree and the corresponding coefficients.
 */
export function findBestFitPolynomial(points: Point[], method: AutoFitMethod = 'BIC'): { bestDegree: number; coefficients: number[] } {
    const n = points.length;
    let bestScore = Infinity;
    let bestDegree = -1;
    let bestCoefficients: number[] = [];

    // Max degree to test is n-1, but capped at 20 for performance and to avoid extreme overfitting.
    const maxDegreeToTest = Math.min(20, n - 1);

    if (maxDegreeToTest < 1) {
        throw new Error("Not enough data points to find a best-fit polynomial (requires at least 2).");
    }
    
    for (let degree = 1; degree <= maxDegreeToTest; degree++) {
        try {
            const coefficients = calculatePolynomialRegression(points, degree);
            
            // Calculate RSS (Residual Sum of Squares)
            let rss = 0;
            for (const point of points) {
                const predictedY = evaluatePolynomial(coefficients, point.x);
                rss += Math.pow(point.y - predictedY, 2);
            }

            if (rss <= 1e-10) { // If perfect fit, it's likely the best, prevent log(0)
                if (bestDegree === -1) { // If it's the first one, take it
                    bestScore = -Infinity;
                    bestDegree = degree;
                    bestCoefficients = coefficients;
                }
                continue;
            }

            // Calculate score using the chosen method
            const k = degree + 1; // Number of parameters
            let score;

            if (method === 'AIC') {
                // Akaike Information Criterion (less penalty for complexity)
                score = n * Math.log(rss / n) + 2 * k;
            } else { 
                // Bayesian Information Criterion (default, more penalty for complexity)
                score = n * Math.log(rss / n) + k * Math.log(n);
            }

            if (score < bestScore) {
                bestScore = score;
                bestDegree = degree;
                bestCoefficients = coefficients;
            }
        } catch (error) {
            // Regression failed for this degree (e.g., singular matrix), so we skip it.
            console.warn(`Could not calculate regression for degree ${degree}:`, error);
        }
    }
    
    if (bestDegree === -1) {
        throw new Error("Could not determine a best-fit model for the given data.");
    }

    return { bestDegree, coefficients: bestCoefficients };
}