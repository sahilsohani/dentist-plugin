import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import classNames from 'classnames';

interface SurveyFormData {
  snoring: boolean | null;
  tired: boolean | null;
  observed: boolean | null;
  pressure: boolean | null;
  bmiOver35: boolean | null;
  ageOver50: boolean | null;
  neckSizeOver16: boolean | null;
  genderMale: boolean | null;
  height: number | null;
  weight: number | null;
  heightUnit: 'cm' | 'ft';
  weightUnit: 'kg' | 'lbs';
  age: number | null;
  neckSize: number | null;
  neckUnit: 'cm' | 'inches';
  fullName: string;
  email: string;
  phone: string;
}

const SleepApneaSurvey: React.FC = () => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SurveyFormData>({
    defaultValues: {
      snoring: null,
      tired: null,
      observed: null,
      pressure: null,
      bmiOver35: null,
      ageOver50: null,
      neckSizeOver16: null,
      genderMale: null,
      height: null,
      weight: null,
      heightUnit: 'cm',
      weightUnit: 'kg',
      age: null,
      neckSize: null,
      neckUnit: 'inches',
      fullName: '',
      email: '',
      phone: '',
    },
    mode: 'onSubmit',
  });

  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [surveyResults, setSurveyResults] = useState<{
    score: number;
    riskLevel: string;
    name: string;
  } | null>(null);

  const getCurrentStep = () => {
    const values = getValues();
    let step = 0;
    const surveyFields = [
      'snoring',
      'tired',
      'observed',
      'pressure',
      'bmiOver35',
      'ageOver50',
      'neckSizeOver16',
      'genderMale',
    ];

    surveyFields.forEach((field) => {
      if (values[field as keyof SurveyFormData] !== null) step++;
    });

    if (values.fullName && values.email && values.phone) step++;

    return step;
  };

  const calculateScore = useCallback(() => {
    const values = getValues();
    const questions = [
      'snoring',
      'tired',
      'observed',
      'pressure',
      'bmiOver35',
      'ageOver50',
      'neckSizeOver16',
      'genderMale',
    ] as const;
    return questions.reduce(
      (sum, question) => sum + (values[question] === true ? 1 : 0),
      0
    );
  }, [getValues]);

  const getRiskLevel = (score: number): string => {
    if (score >= 0 && score <= 2) return 'Low Risk';
    if (score >= 3 && score <= 4) return 'Intermediate Risk';
    if (score >= 5 && score <= 8) return 'High Risk';
    return 'Unknown Risk';
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'Intermediate Risk':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'High Risk':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleAgeCalculation = useCallback(
    (age: number) => {
      if (age && age > 0) {
        setValue('ageOver50', age > 50, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    },
    [setValue]
  );

  const handleNeckCalculation = useCallback(
    (neckSize?: number, neckUnit?: string) => {
      const values = getValues();
      const ns = neckSize ?? values.neckSize;
      const nu = neckUnit ?? values.neckUnit;

      if (ns && ns > 0) {
        let neckInInches = ns;
        if (nu === 'cm') {
          neckInInches = ns / 2.54;
        }
        setValue('neckSizeOver16', neckInInches > 16, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    },
    [setValue, getValues]
  );

  const checkIfFormComplete = () => {
    const values = getValues();
    const requiredSurveyFields: (keyof SurveyFormData)[] = [
      'snoring',
      'tired',
      'observed',
      'pressure',
      'bmiOver35',
      'ageOver50',
      'neckSizeOver16',
      'genderMale',
    ];

    const surveyComplete = requiredSurveyFields.every(
      (field) => values[field] !== null
    );
    const contactComplete =
      values.fullName.trim() !== '' &&
      values.email.trim() !== '' &&
      values.phone.trim() !== '';

    return surveyComplete && contactComplete;
  };

  const onSubmit = (data: SurveyFormData) => {
    if (!checkIfFormComplete()) {
      alert(
        'Please answer all questions and complete contact information before submitting.'
      );
      return;
    }

    const finalScore = calculateScore();
    const riskLevel = getRiskLevel(finalScore);

    setSurveyResults({
      score: finalScore,
      riskLevel: riskLevel,
      name: data.fullName,
    });

    setShowResults(true);

    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restartSurvey = () => {
    setShowResults(false);
    setSurveyResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Results Display Component
  const ResultsDisplay: React.FC<{
    results: { score: number; riskLevel: string; name: string };
  }> = ({ results }) => (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Thank You Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✅ Thank you, {results.name}!
        </h1>

        {/* Score Display */}
        <div className="mb-6">
          <p className="text-xl text-gray-700 mb-4">Your STOP-BANG score:</p>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-200 mb-4">
            <span className="text-3xl font-bold text-blue-600">
              {results.score}/8
            </span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-3">You may be at</p>
          <div
            className={classNames(
              'inline-block px-6 py-3 rounded-lg border-2 font-semibold text-lg',
              getRiskColor(results.riskLevel)
            )}
          >
            {results.riskLevel}
          </div>
          <p className="text-lg text-gray-700 mt-3">
            for Obstructive Sleep Apnea.
          </p>
        </div>

        {/* Risk Level Explanation */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What this means:</h3>
          {results.riskLevel === 'Low Risk' && (
            <p className="text-gray-700">
              Your score suggests a lower probability of having moderate to
              severe obstructive sleep apnea. However, if you continue to
              experience sleep-related symptoms, consider discussing them with
              your healthcare provider.
            </p>
          )}
          {results.riskLevel === 'Intermediate Risk' && (
            <p className="text-gray-700">
              Your score suggests an intermediate probability of having moderate
              to severe obstructive sleep apnea. We recommend discussing these
              results with your healthcare provider for further evaluation.
            </p>
          )}
          {results.riskLevel === 'High Risk' && (
            <p className="text-gray-700">
              Your score suggests a high probability of having moderate to
              severe obstructive sleep apnea. We strongly recommend discussing
              these results with your healthcare provider for comprehensive
              evaluation and potential sleep study.
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Next Steps:</h3>
          <p className="text-blue-800">
            A member of our team will reach out to you shortly to discuss your
            results and care options.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h12v3h-1a2 2 0 01-2 2H7a2 2 0 01-2-2z"
                clipRule="evenodd"
              />
            </svg>
            Print Results
          </button>

          <button
            onClick={restartSurvey}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Take Survey Again
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Disclaimer:</strong> This assessment is for screening
            purposes only and does not replace professional medical advice.
            Please consult with a healthcare provider for proper diagnosis and
            treatment.
          </p>
        </div>
      </div>
    </div>
  );

  // Show results if survey is completed
  if (showResults && surveyResults) {
    return <ResultsDisplay results={surveyResults} />;
  }

  // Rest of the original components (YesNoQuestion, BMICalculator, etc.)
  const YesNoQuestion: React.FC<{
    name: keyof SurveyFormData;
    title: string;
    description: string;
    disabled?: boolean;
  }> = React.memo(({ name, title, description, disabled = false }) => {
    const [localValue, setLocalValue] = useState<boolean | null>(null);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);

    return (
      <div
        className={classNames(
          'bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-300',
          {
            'border-gray-200 hover:border-gray-300': !isAnswered,
            'border-green-200 bg-green-50': isAnswered && localValue === true,
            'border-red-200 bg-red-50': isAnswered && localValue === false,
            'shadow-md': isAnswered,
          }
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isAnswered && (
            <div className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Answered
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4">{description}</p>

        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value) => value !== null || 'This question is required',
          }}
          render={({ field }) => (
            <div className="flex space-x-4">
              <label
                className={classNames(
                  'flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 flex-1',
                  {
                    'border-green-500 bg-green-100 shadow-md scale-105':
                      field.value === true,
                    'border-gray-300 hover:border-green-400 hover:bg-green-50':
                      field.value !== true,
                    'opacity-50 cursor-not-allowed': disabled,
                  }
                )}
              >
                <input
                  type="radio"
                  checked={field.value === true}
                  onChange={(e) => {
                    e.preventDefault();
                    field.onChange(true);
                    setLocalValue(true);
                    setIsAnswered(true);
                  }}
                  disabled={disabled}
                  className="sr-only"
                />
                <div
                  className={classNames(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    {
                      'border-green-500 bg-green-500': field.value === true,
                      'border-gray-400': field.value !== true,
                    }
                  )}
                >
                  {field.value === true && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={classNames(
                    'font-medium transition-colors duration-200',
                    {
                      'text-green-700': field.value === true,
                      'text-gray-900': field.value !== true,
                    }
                  )}
                >
                  Yes
                </span>
              </label>

              <label
                className={classNames(
                  'flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 flex-1',
                  {
                    'border-red-500 bg-red-100 shadow-md scale-105':
                      field.value === false,
                    'border-gray-300 hover:border-red-400 hover:bg-red-50':
                      field.value !== false,
                    'opacity-50 cursor-not-allowed': disabled,
                  }
                )}
              >
                <input
                  type="radio"
                  checked={field.value === false}
                  onChange={(e) => {
                    e.preventDefault();
                    field.onChange(false);
                    setLocalValue(false);
                    setIsAnswered(true);
                  }}
                  disabled={disabled}
                  className="sr-only"
                />
                <div
                  className={classNames(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    {
                      'border-red-500 bg-red-500': field.value === false,
                      'border-gray-400': field.value !== false,
                    }
                  )}
                >
                  {field.value === false && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={classNames(
                    'font-medium transition-colors duration-200',
                    {
                      'text-red-700': field.value === false,
                      'text-gray-900': field.value !== false,
                    }
                  )}
                >
                  No
                </span>
              </label>
            </div>
          )}
        />

        {errors[name] && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors[name]?.message}
            </p>
          </div>
        )}
        {!errors[name] && <div className="mt-3 h-0" />}
      </div>
    );
  });

  const BMICalculator: React.FC<{
    onBMICalculated: (bmi: number) => void;
    onReset: () => void;
  }> = React.memo(({ onBMICalculated, onReset }) => {
    const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [showBMI, setShowBMI] = useState<boolean>(false);
    const [localBMI, setLocalBMI] = useState<number | null>(null);

    const calculateBMI = () => {
      const h = parseFloat(height);
      const w = parseFloat(weight);

      if (!h || !w || h <= 0 || w <= 0) {
        alert('Please enter valid height and weight values');
        return;
      }

      let heightInMeters = h;
      let weightInKg = w;

      if (units === 'imperial') {
        heightInMeters = h * 0.0254;
        weightInKg = w * 0.453592;
      } else {
        heightInMeters = h / 100;
      }

      const bmi = weightInKg / (heightInMeters * heightInMeters);
      const roundedBmi = Math.round(bmi * 10) / 10;

      setLocalBMI(roundedBmi);
      setShowBMI(true);
      onBMICalculated(roundedBmi);
    };

    const resetCalculator = () => {
      setHeight('');
      setWeight('');
      setLocalBMI(null);
      setShowBMI(false);
      onReset();
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          BMI Calculator
        </h3>
        <p className="text-gray-600 mb-4">
          Calculate your BMI to determine if it's over 35.
        </p>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Select units:
          </p>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={units === 'metric'}
                onChange={() => setUnits('metric')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">cm / kg</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={units === 'imperial'}
                onChange={() => setUnits('imperial')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">in / lb</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height ({units === 'metric' ? 'cm' : 'in'})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={`Enter height in ${
                units === 'metric' ? 'cm' : 'inches'
              }`}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight ({units === 'metric' ? 'kg' : 'lb'})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={`Enter weight in ${
                units === 'metric' ? 'kg' : 'pounds'
              }`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={calculateBMI}
            disabled={!height || !weight}
            className={classNames(
              'px-4 py-2 rounded-md font-medium transition-all mr-2',
              {
                'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer':
                  height && weight,
                'bg-gray-300 text-gray-500 cursor-not-allowed':
                  !height || !weight,
              }
            )}
          >
            Calculate BMI
          </button>
          {showBMI && (
            <button
              type="button"
              onClick={resetCalculator}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {showBMI && localBMI && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium text-blue-900">
              Your BMI: <span className="text-lg font-bold">{localBMI}</span>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              BMI over 35:{' '}
              <span className="font-semibold">
                {localBMI > 35 ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        )}
      </div>
    );
  });

  const Question5: React.FC<{ control: any; setValue: any; errors: any }> =
    React.memo(({ control, setValue, errors }) => {
      const [isDisabled, setIsDisabled] = useState(false);
      const [bmiCalculated, setBmiCalculated] = useState(false);

      const handleBMICalculated = (bmi: number) => {
        setTimeout(() => {
          setValue('bmiOver35', bmi > 35, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
          setIsDisabled(true);
          setBmiCalculated(true);
        }, 0);
      };

      const handleReset = () => {
        setTimeout(() => {
          setValue('bmiOver35', null, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
          setIsDisabled(false);
          setBmiCalculated(false);
        }, 0);
      };

      return (
        <>
          <BMICalculator
            onBMICalculated={handleBMICalculated}
            onReset={handleReset}
          />

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              BMI &gt; 35
            </h3>
            <p className="text-gray-600 mb-4">Is your BMI over 35?</p>

            <Controller
              name="bmiOver35"
              control={control}
              rules={{
                validate: (value) =>
                  value !== null || 'This question is required',
              }}
              render={({ field }) => (
                <div className="flex space-x-4">
                  <label
                    className={classNames(
                      'flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all',
                      {
                        'border-green-500 bg-green-50': field.value === true,
                        'border-gray-300 hover:border-gray-400':
                          field.value !== true,
                        'opacity-50 cursor-not-allowed': isDisabled,
                      }
                    )}
                  >
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => !isDisabled && field.onChange(true)}
                      disabled={isDisabled}
                      className="sr-only"
                    />
                    <div
                      className={classNames(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        {
                          'border-green-500 bg-green-500': field.value === true,
                          'border-gray-300': field.value !== true,
                        }
                      )}
                    >
                      {field.value === true && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Yes</span>
                  </label>

                  <label
                    className={classNames(
                      'flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all',
                      {
                        'border-red-500 bg-red-50': field.value === false,
                        'border-gray-300 hover:border-gray-400':
                          field.value !== false,
                        'opacity-50 cursor-not-allowed': isDisabled,
                      }
                    )}
                  >
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => !isDisabled && field.onChange(false)}
                      disabled={isDisabled}
                      className="sr-only"
                    />
                    <div
                      className={classNames(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        {
                          'border-red-500 bg-red-500': field.value === false,
                          'border-gray-300': field.value !== false,
                        }
                      )}
                    >
                      {field.value === false && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">No</span>
                  </label>
                </div>
              )}
            />

            {errors.bmiOver35 && (
              <div className="mt-2 h-6">
                <p className="text-sm text-red-600">
                  {errors.bmiOver35?.message}
                </p>
              </div>
            )}
            {!errors.bmiOver35 && <div className="mt-2 h-6" />}

            {bmiCalculated && (
              <p className="text-xs text-gray-500 mt-2">
                * This question has been automatically set based on your
                calculated BMI
              </p>
            )}
          </div>
        </>
      );
    });

  const BMISection: React.FC = React.memo(() => (
    <Question5 control={control} setValue={setValue} errors={errors} />
  ));

  const AgeInput: React.FC = React.memo(() => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Age</h3>
      <p className="text-gray-600 mb-4">Please enter your age.</p>

      <Controller
        name="age"
        control={control}
        rules={{
          required: 'Age is required',
          min: { value: 1, message: 'Please enter a valid age' },
          max: { value: 120, message: 'Please enter a valid age' },
        }}
        render={({ field }) => (
          <input
            type="number"
            placeholder="Enter your age"
            value={field.value || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              field.onChange(value);
              if (value) {
                setTimeout(() => handleAgeCalculation(value), 0);
              }
            }}
            onBlur={field.onBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
        )}
      />
      {errors.age && (
        <p className="mb-4 text-sm text-red-600">{errors.age.message}</p>
      )}

      <YesNoQuestion
        name="ageOver50"
        title="Age > 50"
        description="Are you over 50 years old?"
        disabled={true}
      />
    </div>
  ));

  const NeckSizeInput: React.FC = React.memo(() => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Neck Size</h3>
      <p className="text-gray-600 mb-4">
        Please measure your neck circumference.
      </p>

      <div className="flex space-x-2 mb-4">
        <Controller
          name="neckSize"
          control={control}
          rules={{
            required: 'Neck size is required',
            min: { value: 1, message: 'Please enter a valid neck size' },
          }}
          render={({ field }) => (
            <input
              type="number"
              step="0.1"
              placeholder="Enter neck size"
              value={field.value || ''}
              onChange={(e) => {
                const value = e.target.value
                  ? parseFloat(e.target.value)
                  : null;
                field.onChange(value);
                if (value) {
                  setTimeout(() => handleNeckCalculation(value), 0);
                }
              }}
              onBlur={field.onBlur}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        <Controller
          name="neckUnit"
          control={control}
          render={({ field }) => (
            <select
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                setTimeout(
                  () => handleNeckCalculation(undefined, e.target.value),
                  0
                );
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inches">inches</option>
              <option value="cm">cm</option>
            </select>
          )}
        />
      </div>
      {errors.neckSize && (
        <p className="mb-4 text-sm text-red-600">{errors.neckSize.message}</p>
      )}

      <YesNoQuestion
        name="neckSizeOver16"
        title="Neck Size > 16 inches"
        description="Is your neck circumference greater than 16 inches (40cm)?"
        disabled={true}
      />
    </div>
  ));

  const ContactFields: React.FC = React.memo(() => {
    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [errors, setErrors] = useState<{
      fullName?: string;
      email?: string;
      phone?: string;
    }>({});
    const [touched, setTouched] = useState<{
      fullName?: boolean;
      email?: boolean;
      phone?: boolean;
    }>({});

    React.useEffect(() => {
      setValue('fullName', fullName, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, [fullName]);

    React.useEffect(() => {
      setValue('email', email, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, [email]);

    React.useEffect(() => {
      setValue('phone', phone, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, [phone]);

    const validateField = (field: string, value: string) => {
      const newErrors = { ...errors };

      switch (field) {
        case 'fullName':
          if (!value.trim()) {
            newErrors.fullName = 'Full name is required';
          } else if (value.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
          } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            newErrors.fullName = 'Name can only contain letters and spaces';
          } else {
            delete newErrors.fullName;
          }
          break;
        case 'email':
          if (!value.trim()) {
            newErrors.email = 'Email is required';
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            newErrors.email = 'Please enter a valid email address';
          } else {
            delete newErrors.email;
          }
          break;
        case 'phone':
          if (!value.trim()) {
            newErrors.phone = 'Phone number is required';
          } else if (value.length < 10) {
            newErrors.phone = 'Phone number must be at least 10 digits';
          } else if (
            !/^[\+]?[1-9][\d]{0,15}$|^[\(]?[\d]{3}[\)]?[\s\-]?[\d]{3}[\s\-]?[\d]{4}$/.test(
              value
            )
          ) {
            newErrors.phone = 'Please enter a valid phone number';
          } else {
            delete newErrors.phone;
          }
          break;
      }

      setErrors(newErrors);
    };

    const getFieldStatus = (field: string, value: string) => {
      if (!touched[field as keyof typeof touched]) return 'default';
      if (errors[field as keyof typeof errors]) return 'error';
      if (value.trim()) return 'success';
      return 'default';
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h3>
            <p className="text-gray-600 text-sm">
              Your details are kept confidential and secure
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, fullName: true }));
                  validateField('fullName', fullName);
                }}
                className={classNames(
                  'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 pl-10',
                  {
                    'border-gray-300 focus:ring-blue-500 focus:border-blue-500':
                      getFieldStatus('fullName', fullName) === 'default',
                    'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50':
                      getFieldStatus('fullName', fullName) === 'error',
                    'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50':
                      getFieldStatus('fullName', fullName) === 'success',
                  }
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {getFieldStatus('fullName', fullName) === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.fullName && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.fullName}
              </div>
            )}
            {!errors.fullName && <div className="mt-2 h-5" />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, email: true }));
                  validateField('email', email);
                }}
                className={classNames(
                  'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 pl-10',
                  {
                    'border-gray-300 focus:ring-blue-500 focus:border-blue-500':
                      getFieldStatus('email', email) === 'default',
                    'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50':
                      getFieldStatus('email', email) === 'error',
                    'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50':
                      getFieldStatus('email', email) === 'success',
                  }
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              {getFieldStatus('email', email) === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.email}
              </div>
            )}
            {!errors.email && <div className="mt-2 h-5" />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, phone: true }));
                  validateField('phone', phone);
                }}
                className={classNames(
                  'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 pl-10',
                  {
                    'border-gray-300 focus:ring-blue-500 focus:border-blue-500':
                      getFieldStatus('phone', phone) === 'default',
                    'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50':
                      getFieldStatus('phone', phone) === 'error',
                    'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50':
                      getFieldStatus('phone', phone) === 'success',
                  }
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              {getFieldStatus('phone', phone) === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.phone}
              </div>
            )}
            {!errors.phone && <div className="mt-2 h-5" />}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          STOP-Bang Sleep Apnea Survey
        </h1>
        <p className="text-gray-600">
          This questionnaire helps assess your risk for obstructive sleep apnea.
          Please answer all questions honestly.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Privacy Notice:</strong> Your information is confidential
            and will only be used for medical assessment purposes.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        autoComplete="off"
        noValidate
      >
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-6 z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Survey Progress
            </span>
            <span className="text-sm text-gray-600">Complete all sections</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-0"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Answer all questions to see your STOP-Bang score
          </p>
        </div>

        <YesNoQuestion
          name="snoring"
          title="S - Snoring"
          description="Do you snore loudly (loud enough to be heard through closed doors or your bed-partner elbows you)?"
        />

        <YesNoQuestion
          name="tired"
          title="T - Tired"
          description="Do you often feel tired, fatigued, or sleepy during the day?"
        />

        <YesNoQuestion
          name="observed"
          title="O - Observed"
          description="Has anyone observed you stop breathing or gasping during sleep?"
        />

        <YesNoQuestion
          name="pressure"
          title="P - Pressure"
          description="Do you have or are you being treated for high blood pressure?"
        />

        <BMISection />

        <AgeInput />

        <NeckSizeInput />

        <YesNoQuestion
          name="genderMale"
          title="G - Gender"
          description="Are you male?"
        />

        <ContactFields />

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Submit?
            </h3>
            <p className="text-gray-600 text-sm">
              Please review your answers before submitting your survey.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Submit Sleep Apnea Survey</span>
          </button>

          <p className="mt-3 text-xs text-gray-500 text-center">
            By submitting, you acknowledge that the information provided is
            accurate to the best of your knowledge.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SleepApneaSurvey;
