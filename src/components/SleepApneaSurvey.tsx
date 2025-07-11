import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import classNames from "classnames";

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
  heightUnit: "cm" | "ft";
  weightUnit: "kg" | "lbs";
  age: number | null;
  neckSize: number | null;
  neckUnit: "cm" | "inches";
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
      heightUnit: "cm",
      weightUnit: "kg",
      age: null,
      neckSize: null,
      neckUnit: "inches",
      fullName: "",
      email: "",
      phone: "",
    },
    mode: "onSubmit",
  });

  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [surveyResults, setSurveyResults] = useState<{
    score: number;
    riskLevel: string;
    name: string;
  } | null>(null);
  const [emailResults, setEmailResults] = useState(false);

  const getCurrentStep = () => {
    const values = getValues();
    let step = 0;
    const surveyFields = [
      "snoring",
      "tired",
      "observed",
      "pressure",
      "bmiOver35",
      "ageOver50",
      "neckSizeOver16",
      "genderMale",
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
      "snoring",
      "tired",
      "observed",
      "pressure",
      "bmiOver35",
      "ageOver50",
      "neckSizeOver16",
      "genderMale",
    ] as const;
    return questions.reduce(
      (sum, question) => sum + (values[question] === true ? 1 : 0),
      0,
    );
  }, [getValues]);

  const getRiskLevel = (score: number): string => {
    if (score >= 0 && score <= 2) return "Low Risk";
    if (score >= 3 && score <= 4) return "Intermediate Risk";
    if (score >= 5 && score <= 8) return "High Risk";
    return "Unknown Risk";
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case "Low Risk":
        return "text-green-600 bg-green-100 border-green-200";
      case "Intermediate Risk":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "High Risk":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const handleAgeCalculation = useCallback(
    (age: number) => {
      if (age && age > 0) {
        setValue("ageOver50", age > 50, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    },
    [setValue],
  );

  const handleNeckCalculation = useCallback(
    (neckSize?: number, neckUnit?: string) => {
      const values = getValues();
      const ns = neckSize ?? values.neckSize;
      const nu = neckUnit ?? values.neckUnit;

      if (ns && ns > 0) {
        let neckInInches = ns;
        if (nu === "cm") {
          neckInInches = ns / 2.54;
        }
        setValue("neckSizeOver16", neckInInches > 16, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    },
    [setValue, getValues],
  );

  const checkIfFormComplete = () => {
    const values = getValues();
    const requiredSurveyFields: (keyof SurveyFormData)[] = [
      "snoring",
      "tired",
      "observed",
      "pressure",
      "bmiOver35",
      "ageOver50",
      "neckSizeOver16",
      "genderMale",
    ];

    const surveyComplete = requiredSurveyFields.every(
      (field) => values[field] !== null,
    );
    const contactComplete =
      values.fullName.trim() !== "" &&
      values.email.trim() !== "" &&
      values.phone.trim() !== "";

    return surveyComplete && contactComplete;
  };

  const onSubmit = (data: SurveyFormData) => {
    if (!checkIfFormComplete()) {
      alert(
        "Please answer all questions and complete contact information before submitting.",
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restartSurvey = () => {
    setShowResults(false);
    setSurveyResults(null);
    setEmailResults(false);

    // Reset all form fields to their default values
    const defaultValues = {
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
      heightUnit: "cm" as const,
      weightUnit: "kg" as const,
      age: null,
      neckSize: null,
      neckUnit: "inches" as const,
      fullName: "",
      email: "",
      phone: "",
    };

    // Reset form values
    Object.entries(defaultValues).forEach(([key, value]) => {
      setValue(key as keyof SurveyFormData, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });

    // Reset calculated BMI
    setCalculatedBMI(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Results Display Component
  const ResultsDisplay: React.FC<{
    results: { score: number; riskLevel: string; name: string };
  }> = ({ results }) => (
    <div
      className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen"
      data-oid="kukkh7h"
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 text-center"
        data-oid="42p541g"
      >
        {/* Success Icon */}
        <div
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
          data-oid="5i:w06v"
        >
          <svg
            className="h-8 w-8 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            data-oid="4k.yyvx"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
              data-oid="vjna.t."
            />
          </svg>
        </div>

        {/* Thank You Message */}
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          data-oid="zq5ug2y"
        >
          ✅ Thank you, {results.name}!
        </h1>

        {/* Score Display */}
        <div className="mb-6" data-oid="ehvh70l">
          <p className="text-xl text-gray-700 mb-4" data-oid="taf9ts8">
            Your STOP-BANG score:
          </p>
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-200 mb-4"
            data-oid="794rd-k"
          >
            <span
              className="text-3xl font-bold text-blue-600"
              data-oid=".1emg9c"
            >
              {results.score}/8
            </span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="mb-8" data-oid="i5lov4q">
          <p className="text-lg text-gray-700 mb-3" data-oid="6ejmeje">
            You may be at
          </p>
          <div
            className={classNames(
              "inline-block px-6 py-3 rounded-lg border-2 font-semibold text-lg",
              getRiskColor(results.riskLevel),
            )}
            data-oid="ndfq6sp"
          >
            {results.riskLevel}
          </div>
          <p className="text-lg text-gray-700 mt-3" data-oid="5yky4xg">
            for Obstructive Sleep Apnea.
          </p>
        </div>

        {/* Did You Know Section */}
        <div
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8"
          data-oid="j9zet1j"
        >
          <div className="flex items-start space-x-3" data-oid="a93fhdv">
            <div className="text-2xl" data-oid="ou-8vns">
              🧠
            </div>
            <div className="text-left" data-oid="r7-fs:y">
              <h3
                className="font-semibold text-purple-900 mb-3"
                data-oid="2u.rb0j"
              >
                Did You Know?
              </h3>
              <p className="text-gray-700 mb-3" data-oid="ch:ovay">
                Sleep apnea doesn't just affect your sleep — it can impact your
                memory, energy, and even your weight.
              </p>
              <p className="text-gray-700" data-oid="675ue6j">
                At our practice, we treat the{" "}
                <strong data-oid="7_gv068">whole patient</strong> — because
                airway health is vital to dental health.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Risk Factors Section */}
        <div
          className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left"
          data-oid="xt:k072"
        >
          <h3 className="font-semibold text-gray-900 mb-3" data-oid="9ru.sg.">
            Additional Risk Factors That May Be Linked to Sleep Apnea
          </h3>
          <p className="text-gray-600 text-sm mb-4 italic" data-oid="u4hpcl-">
            *(Check any that apply to you):*
          </p>

          <div className="space-y-3" data-oid="vcgt6tq">
            {/* General Risk Factors */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              data-oid="nue84p:"
            >
              {[
                "Depression",
                "Anxiety",
                "Chronic Pain",
                "Difficulty with memory",
                "ADD/ADHD",
                "Family history (relative with sleep apnea or snoring)",
                "Dry mouth",
                "Morning headaches",
                "High caffeine intake (>1–2 cups/day)",
                "Use of sleep medications",
                "Trouble losing weight",
              ].map((factor, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  data-oid="7_kd8pb"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    data-oid="6dp2izb"
                  />

                  <span className="text-gray-700 text-sm" data-oid="sl_wf8o">
                    {factor}
                  </span>
                </label>
              ))}
            </div>

            {/* Female-Specific Section */}
            <div
              className="mt-6 pt-4 border-t border-gray-200"
              data-oid="kxder-a"
            >
              <h4
                className="font-semibold text-gray-900 mb-3"
                data-oid="7muah7x"
              >
                Female Patients:
              </h4>
              <div className="space-y-3" data-oid="nk:dvcl">
                {["PCOS (Polycystic Ovarian Syndrome)", "Post-menopausal"].map(
                  (factor, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      data-oid="r5i49kn"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                        data-oid="t37vj5s"
                      />

                      <span
                        className="text-gray-700 text-sm"
                        data-oid="uatbeod"
                      >
                        {factor}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div
            className="mt-6 pt-4 border-t border-gray-200"
            data-oid="cyh080e"
          >
            <p className="text-xs text-gray-500 italic" data-oid="n_rs6dm">
              Your selections will be shared privately with the care team to
              help understand your unique case.
            </p>
          </div>
        </div>

        {/* Risk Level Explanation */}
        <div
          className="bg-gray-50 rounded-lg p-6 mb-8 text-left"
          data-oid="kc6xywp"
        >
          <h3 className="font-semibold text-gray-900 mb-3" data-oid="buy.whl">
            What this means:
          </h3>
          {results.riskLevel === "Low Risk" && (
            <p className="text-gray-700" data-oid="-eh7a5-">
              Your score suggests a lower probability of having moderate to
              severe obstructive sleep apnea. However, if you continue to
              experience sleep-related symptoms, consider discussing them with
              your healthcare provider.
            </p>
          )}
          {results.riskLevel === "Intermediate Risk" && (
            <p className="text-gray-700" data-oid="4_un29b">
              Your score suggests an intermediate probability of having moderate
              to severe obstructive sleep apnea. We recommend discussing these
              results with your healthcare provider for further evaluation.
            </p>
          )}
          {results.riskLevel === "High Risk" && (
            <p className="text-gray-700" data-oid="x:37g7j">
              Your score suggests a high probability of having moderate to
              severe obstructive sleep apnea. We strongly recommend discussing
              these results with your healthcare provider for comprehensive
              evaluation and potential sleep study.
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
          data-oid="l1pyxrz"
        >
          <h3 className="font-semibold text-blue-900 mb-3" data-oid="5ly1dyq">
            Next Steps:
          </h3>
          <p className="text-blue-800" data-oid="mjk99fz">
            A member of our team will reach out to you shortly to discuss your
            results and care options.
          </p>
        </div>

        {/* Email Toggle */}
        <div className="mb-6" data-oid="eogxif_">
          <label
            className="flex items-center justify-center space-x-3 cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-colors"
            data-oid="y.ftcuj"
          >
            <input
              type="checkbox"
              checked={emailResults}
              onChange={(e) => setEmailResults(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              data-oid="igso_19"
            />

            <div className="flex items-center space-x-2" data-oid="4i2q.uw">
              <span className="text-lg" data-oid="iublib_">
                📩
              </span>
              <span className="text-gray-700 font-medium" data-oid="wnv9a5h">
                Email me a copy of my results
              </span>
            </div>
          </label>
          {emailResults && (
            <p
              className="text-xs text-blue-600 mt-2 text-center"
              data-oid="iqy1egg"
            >
              Results will be sent to the email address you provided:{" "}
              <strong data-oid="vw988kq">{results.name}</strong>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          data-oid="w-ydu9-"
        >
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
            data-oid="8a9vtp2"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              data-oid="rel5_h9"
            >
              <path
                fillRule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm4 0h2v2H9v-2zM15 11h1v3h-1v-3z"
                clipRule="evenodd"
                data-oid="8fdmu52"
              />
            </svg>
            Print Results
          </button>

          <button
            onClick={restartSurvey}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            data-oid="l7jr10b"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              data-oid="jmf6917"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
                data-oid="imkj47w"
              />
            </svg>
            Retake Survey
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-200" data-oid="tvkz3mv">
          <p className="text-xs text-gray-500" data-oid="m3qygc0">
            <strong data-oid="gyyn_h:">Disclaimer:</strong> This assessment is
            for screening purposes only and does not replace professional
            medical advice. Please consult with a healthcare provider for proper
            diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );

  // Show results if survey is completed
  if (showResults && surveyResults) {
    return <ResultsDisplay results={surveyResults} data-oid="i.acz7d" />;
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
          "bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-300",
          {
            "border-gray-200 hover:border-gray-300": !isAnswered,
            "border-green-200 bg-green-50": isAnswered && localValue === true,
            "border-red-200 bg-red-50": isAnswered && localValue === false,
            "shadow-md": isAnswered,
          },
        )}
        data-oid=".p_9_9o"
      >
        <div
          className="flex items-start justify-between mb-2"
          data-oid="tfm--zc"
        >
          <h3
            className="text-lg font-semibold text-gray-900"
            data-oid="m.wkr78"
          >
            {title}
          </h3>
          {isAnswered && (
            <div
              className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full"
              data-oid="8hjo-pj"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="33._255"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                  data-oid="o6uyrau"
                />
              </svg>
              Answered
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4" data-oid="8k2-j2f">
          {description}
        </p>

        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value) => value !== null || "This question is required",
          }}
          render={({ field }) => (
            <div className="flex space-x-4" data-oid="yq:52qs">
              <label
                className={classNames(
                  "flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 flex-1",
                  {
                    "border-green-500 bg-green-100 shadow-md scale-105":
                      field.value === true,
                    "border-gray-300 hover:border-green-400 hover:bg-green-50":
                      field.value !== true,
                    "opacity-50 cursor-not-allowed": disabled,
                  },
                )}
                data-oid="n3izq85"
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
                  data-oid="-vi7t2y"
                />

                <div
                  className={classNames(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    {
                      "border-green-500 bg-green-500": field.value === true,
                      "border-gray-400": field.value !== true,
                    },
                  )}
                  data-oid="g57oivp"
                >
                  {field.value === true && (
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-pulse"
                      data-oid="h41t7d5"
                    />
                  )}
                </div>
                <span
                  className={classNames(
                    "font-medium transition-colors duration-200",
                    {
                      "text-green-700": field.value === true,
                      "text-gray-900": field.value !== true,
                    },
                  )}
                  data-oid="figzcxo"
                >
                  Yes
                </span>
              </label>

              <label
                className={classNames(
                  "flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 flex-1",
                  {
                    "border-red-500 bg-red-100 shadow-md scale-105":
                      field.value === false,
                    "border-gray-300 hover:border-red-400 hover:bg-red-50":
                      field.value !== false,
                    "opacity-50 cursor-not-allowed": disabled,
                  },
                )}
                data-oid="u0n4hqd"
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
                  data-oid="abe8yh5"
                />

                <div
                  className={classNames(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    {
                      "border-red-500 bg-red-500": field.value === false,
                      "border-gray-400": field.value !== false,
                    },
                  )}
                  data-oid="hqx3lbk"
                >
                  {field.value === false && (
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-pulse"
                      data-oid="v_jah2o"
                    />
                  )}
                </div>
                <span
                  className={classNames(
                    "font-medium transition-colors duration-200",
                    {
                      "text-red-700": field.value === false,
                      "text-gray-900": field.value !== false,
                    },
                  )}
                  data-oid="bddnih5"
                >
                  No
                </span>
              </label>
            </div>
          )}
          data-oid="p4dw3s4"
        />

        {errors[name] && (
          <div
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"
            data-oid="ej0c4zb"
          >
            <p
              className="text-sm text-red-600 flex items-center"
              data-oid="_656zej"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="ovsdjvo"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                  data-oid="k5iatiy"
                />
              </svg>
              {errors[name]?.message}
            </p>
          </div>
        )}
        {!errors[name] && <div className="mt-3 h-0" data-oid=".m9j_3x" />}
      </div>
    );
  });

  const BMICalculator: React.FC<{
    onBMICalculated: (bmi: number) => void;
    onReset: () => void;
  }> = React.memo(({ onBMICalculated, onReset }) => {
    const [units, setUnits] = useState<"metric" | "imperial">("metric");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [showBMI, setShowBMI] = useState<boolean>(false);
    const [localBMI, setLocalBMI] = useState<number | null>(null);

    const calculateBMI = () => {
      const h = parseFloat(height);
      const w = parseFloat(weight);

      if (!h || !w || h <= 0 || w <= 0) {
        alert("Please enter valid height and weight values");
        return;
      }

      let heightInMeters = h;
      let weightInKg = w;

      if (units === "imperial") {
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
      setHeight("");
      setWeight("");
      setLocalBMI(null);
      setShowBMI(false);
      onReset();
    };

    return (
      <div
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        data-oid="1bph2-0"
      >
        <h3
          className="text-lg font-semibold text-gray-900 mb-2"
          data-oid="_l4lbw7"
        >
          BMI Calculator
        </h3>
        <p className="text-gray-600 mb-4" data-oid="oz_bawo">
          Calculate your BMI to determine if it's over 35.
        </p>

        <div className="mb-4" data-oid="nkamy8r">
          <p
            className="text-sm font-medium text-gray-700 mb-2"
            data-oid="6bsf5q9"
          >
            Select units:
          </p>
          <div className="flex space-x-4" data-oid="mrtm44z">
            <label
              className="flex items-center space-x-2 cursor-pointer"
              data-oid="w_g.:6w"
            >
              <input
                type="radio"
                checked={units === "metric"}
                onChange={() => setUnits("metric")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                data-oid="0sfa1qg"
              />

              <span className="text-gray-900" data-oid="6qq_ub-">
                cm / kg
              </span>
            </label>
            <label
              className="flex items-center space-x-2 cursor-pointer"
              data-oid="x3y6w0-"
            >
              <input
                type="radio"
                checked={units === "imperial"}
                onChange={() => setUnits("imperial")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                data-oid="d3unlju"
              />

              <span className="text-gray-900" data-oid="hs986pc">
                in / lb
              </span>
            </label>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          data-oid="0so74qy"
        >
          <div data-oid="c22jm41">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              data-oid="yfrrpo5"
            >
              Height ({units === "metric" ? "cm" : "in"})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={`Enter height in ${
                units === "metric" ? "cm" : "inches"
              }`}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-oid="6pcobjm"
            />
          </div>

          <div data-oid="q:wkb5w">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              data-oid="mnil1i."
            >
              Weight ({units === "metric" ? "kg" : "lb"})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={`Enter weight in ${
                units === "metric" ? "kg" : "pounds"
              }`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-oid="8w4fe_p"
            />
          </div>
        </div>

        <div className="mb-4" data-oid="o1_6nu8">
          <button
            type="button"
            onClick={calculateBMI}
            disabled={!height || !weight}
            className={classNames(
              "px-4 py-2 rounded-md font-medium transition-all mr-2",
              {
                "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer":
                  height && weight,
                "bg-gray-300 text-gray-500 cursor-not-allowed":
                  !height || !weight,
              },
            )}
            data-oid="z69sv.k"
          >
            Calculate BMI
          </button>
          {showBMI && (
            <button
              type="button"
              onClick={resetCalculator}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              data-oid="9ezqccq"
            >
              Reset
            </button>
          )}
        </div>

        {showBMI && localBMI && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4" data-oid="ogc4tqu">
            <p className="text-sm font-medium text-blue-900" data-oid="xtlqhxl">
              Your BMI:{" "}
              <span className="text-lg font-bold" data-oid="v74.5jd">
                {localBMI}
              </span>
            </p>
            <p className="text-sm text-blue-700 mt-1" data-oid="is-du2h">
              BMI over 35:{" "}
              <span className="font-semibold" data-oid="-jh1fh3">
                {localBMI > 35 ? "Yes" : "No"}
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
          setValue("bmiOver35", bmi > 35, {
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
          setValue("bmiOver35", null, {
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
            data-oid="rzu8oyl"
          />

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6"
            data-oid="aewa4g0"
          >
            <h3
              className="text-lg font-semibold text-gray-900 mb-2"
              data-oid=":85v_l9"
            >
              BMI &gt; 35
            </h3>
            <p className="text-gray-600 mb-4" data-oid="e9u4i7c">
              Is your BMI over 35?
            </p>

            <Controller
              name="bmiOver35"
              control={control}
              rules={{
                validate: (value) =>
                  value !== null || "This question is required",
              }}
              render={({ field }) => (
                <div className="flex space-x-4" data-oid="blxe5o_">
                  <label
                    className={classNames(
                      "flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all",
                      {
                        "border-green-500 bg-green-50": field.value === true,
                        "border-gray-300 hover:border-gray-400":
                          field.value !== true,
                        "opacity-50 cursor-not-allowed": isDisabled,
                      },
                    )}
                    data-oid="71:q17u"
                  >
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => !isDisabled && field.onChange(true)}
                      disabled={isDisabled}
                      className="sr-only"
                      data-oid="3wsnhr3"
                    />

                    <div
                      className={classNames(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        {
                          "border-green-500 bg-green-500": field.value === true,
                          "border-gray-300": field.value !== true,
                        },
                      )}
                      data-oid="zdtworv"
                    >
                      {field.value === true && (
                        <div
                          className="w-2 h-2 bg-white rounded-full"
                          data-oid="o0hb_fn"
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-gray-900"
                      data-oid=".n4.pmn"
                    >
                      Yes
                    </span>
                  </label>

                  <label
                    className={classNames(
                      "flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all",
                      {
                        "border-red-500 bg-red-50": field.value === false,
                        "border-gray-300 hover:border-gray-400":
                          field.value !== false,
                        "opacity-50 cursor-not-allowed": isDisabled,
                      },
                    )}
                    data-oid="33xlw85"
                  >
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => !isDisabled && field.onChange(false)}
                      disabled={isDisabled}
                      className="sr-only"
                      data-oid="9lncm5f"
                    />

                    <div
                      className={classNames(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        {
                          "border-red-500 bg-red-500": field.value === false,
                          "border-gray-300": field.value !== false,
                        },
                      )}
                      data-oid="8gpj_n7"
                    >
                      {field.value === false && (
                        <div
                          className="w-2 h-2 bg-white rounded-full"
                          data-oid="k:pvd::"
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-gray-900"
                      data-oid="5d4u_ja"
                    >
                      No
                    </span>
                  </label>
                </div>
              )}
              data-oid="09qxdi:"
            />

            {errors.bmiOver35 && (
              <div className="mt-2 h-6" data-oid="cb3bsap">
                <p className="text-sm text-red-600" data-oid="doqc82x">
                  {errors.bmiOver35?.message}
                </p>
              </div>
            )}
            {!errors.bmiOver35 && (
              <div className="mt-2 h-6" data-oid="dcw-hq5" />
            )}

            {bmiCalculated && (
              <p className="text-xs text-gray-500 mt-2" data-oid="73g79e3">
                * This question has been automatically set based on your
                calculated BMI
              </p>
            )}
          </div>
        </>
      );
    });

  const BMISection: React.FC = React.memo(() => (
    <Question5
      control={control}
      setValue={setValue}
      errors={errors}
      data-oid="ak7wuti"
    />
  ));

  const AgeInput: React.FC = React.memo(() => (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      data-oid="hpt_wx_"
    >
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-oid="mjyalcd"
      >
        Age
      </h3>
      <p className="text-gray-600 mb-4" data-oid="zeum7g2">
        Please enter your age.
      </p>

      <Controller
        name="age"
        control={control}
        rules={{
          required: "Age is required",
          min: { value: 1, message: "Please enter a valid age" },
          max: { value: 120, message: "Please enter a valid age" },
        }}
        render={({ field }) => (
          <input
            type="number"
            placeholder="Enter your age"
            value={field.value || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              field.onChange(value);
              if (value) {
                setTimeout(() => handleAgeCalculation(value), 0);
              }
            }}
            onBlur={field.onBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            data-oid="elxsbx5"
          />
        )}
        data-oid="0x:w-vg"
      />

      {errors.age && (
        <p className="mb-4 text-sm text-red-600" data-oid="9za_g8:">
          {errors.age.message}
        </p>
      )}

      <YesNoQuestion
        name="ageOver50"
        title="Age > 50"
        description="Are you over 50 years old?"
        disabled={true}
        data-oid="v7myhsn"
      />
    </div>
  ));

  const NeckSizeInput: React.FC = React.memo(() => (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      data-oid="sm9i.z."
    >
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-oid="qo4v9v-"
      >
        Neck Size
      </h3>
      <p className="text-gray-600 mb-4" data-oid="k:q2qdj">
        Please measure your neck circumference.
      </p>

      <div className="flex space-x-2 mb-4" data-oid="xs_.o9d">
        <Controller
          name="neckSize"
          control={control}
          rules={{
            required: "Neck size is required",
            min: { value: 1, message: "Please enter a valid neck size" },
          }}
          render={({ field }) => (
            <input
              type="number"
              step="0.1"
              placeholder="Enter neck size"
              value={field.value || ""}
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
              data-oid="hq-1nvf"
            />
          )}
          data-oid="xjup_8x"
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
                  0,
                );
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-oid="fxpx0wq"
            >
              <option value="inches" data-oid="o7vgv4k">
                inches
              </option>
              <option value="cm" data-oid="y.y69-q">
                cm
              </option>
            </select>
          )}
          data-oid="zutpcw2"
        />
      </div>
      {errors.neckSize && (
        <p className="mb-4 text-sm text-red-600" data-oid="nl_.:68">
          {errors.neckSize.message}
        </p>
      )}

      <YesNoQuestion
        name="neckSizeOver16"
        title="Neck Size > 16 inches"
        description="Is your neck circumference greater than 16 inches (40cm)?"
        disabled={true}
        data-oid="rjelqbv"
      />
    </div>
  ));

  const ContactFields: React.FC = React.memo(() => {
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
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
      setValue("fullName", fullName, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, [fullName]);

    React.useEffect(() => {
      setValue("email", email, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, [email]);

    React.useEffect(() => {
      setValue("phone", phone, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, [phone]);

    const validateField = (field: string, value: string) => {
      const newErrors = { ...errors };

      switch (field) {
        case "fullName":
          if (!value.trim()) {
            newErrors.fullName = "Full name is required";
          } else if (value.length < 2) {
            newErrors.fullName = "Name must be at least 2 characters";
          } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            newErrors.fullName = "Name can only contain letters and spaces";
          } else {
            delete newErrors.fullName;
          }
          break;
        case "email":
          if (!value.trim()) {
            newErrors.email = "Email is required";
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            newErrors.email = "Please enter a valid email address";
          } else {
            delete newErrors.email;
          }
          break;
        case "phone":
          if (!value.trim()) {
            newErrors.phone = "Phone number is required";
          } else if (value.length < 10) {
            newErrors.phone = "Phone number must be at least 10 digits";
          } else if (
            !/^[\+]?[1-9][\d]{0,15}$|^[\(]?[\d]{3}[\)]?[\s\-]?[\d]{3}[\s\-]?[\d]{4}$/.test(
              value,
            )
          ) {
            newErrors.phone = "Please enter a valid phone number";
          } else {
            delete newErrors.phone;
          }
          break;
      }

      setErrors(newErrors);
    };

    const getFieldStatus = (field: string, value: string) => {
      if (!touched[field as keyof typeof touched]) return "default";
      if (errors[field as keyof typeof errors]) return "error";
      if (value.trim()) return "success";
      return "default";
    };

    return (
      <div
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        data-oid="5xin479"
      >
        <div className="flex items-center mb-4" data-oid="c1t4q5t">
          <div
            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
            data-oid="pf6x_tg"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              data-oid="o4n1c1i"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
                data-oid="-qmdxcd"
              />
            </svg>
          </div>
          <div data-oid="lxmntiw">
            <h3
              className="text-lg font-semibold text-gray-900"
              data-oid="4tn92ij"
            >
              Contact Information
            </h3>
            <p className="text-gray-600 text-sm" data-oid="rhm-1lz">
              Your details are kept confidential and secure
            </p>
          </div>
        </div>

        <div className="space-y-6" data-oid="js-j3a9">
          <div data-oid="c8msxgi">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="9i3piu-"
            >
              Full Name *
            </label>
            <div className="relative" data-oid="ce:4po:">
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, fullName: true }));
                  validateField("fullName", fullName);
                }}
                className={classNames(
                  "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 pl-10",
                  {
                    "border-gray-300 focus:ring-blue-500 focus:border-blue-500":
                      getFieldStatus("fullName", fullName) === "default",
                    "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50":
                      getFieldStatus("fullName", fullName) === "error",
                    "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50":
                      getFieldStatus("fullName", fullName) === "success",
                  },
                )}
                data-oid="s2ebzsa"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="72mvfy_"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="tgdcf_6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                    data-oid="j26vf4q"
                  />
                </svg>
              </div>
              {getFieldStatus("fullName", fullName) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="77bfaku"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="wiw9b5r"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="9pw96x9"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.fullName && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="awvd79q"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="qh23_:-"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="rjle6nk"
                  />
                </svg>
                {errors.fullName}
              </div>
            )}
            {!errors.fullName && (
              <div className="mt-2 h-5" data-oid="lv0h66-" />
            )}
          </div>

          <div data-oid=":ddkjcl">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="41:1xa3"
            >
              Email Address *
            </label>
            <div className="relative" data-oid="ca2iq.k">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, email: true }));
                  validateField("email", email);
                }}
                className={classNames(
                  "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 pl-10",
                  {
                    "border-gray-300 focus:ring-blue-500 focus:border-blue-500":
                      getFieldStatus("email", email) === "default",
                    "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50":
                      getFieldStatus("email", email) === "error",
                    "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50":
                      getFieldStatus("email", email) === "success",
                  },
                )}
                data-oid="j8pbkwz"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid=":b:kl5p"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="x36bpq5"
                >
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    data-oid="_lk4aom"
                  />

                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    data-oid="g:xktpj"
                  />
                </svg>
              </div>
              {getFieldStatus("email", email) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="pwv-n7g"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="0zx:60z"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="rbgs4vt"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid=".emwvnj"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="2lsyjpv"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="b:9zezp"
                  />
                </svg>
                {errors.email}
              </div>
            )}
            {!errors.email && <div className="mt-2 h-5" data-oid="5pdu9z4" />}
          </div>

          <div data-oid="4xql11o">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="g2rjd:z"
            >
              Phone Number *
            </label>
            <div className="relative" data-oid="3qgwq7k">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, phone: true }));
                  validateField("phone", phone);
                }}
                className={classNames(
                  "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 pl-10",
                  {
                    "border-gray-300 focus:ring-blue-500 focus:border-blue-500":
                      getFieldStatus("phone", phone) === "default",
                    "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50":
                      getFieldStatus("phone", phone) === "error",
                    "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50":
                      getFieldStatus("phone", phone) === "success",
                  },
                )}
                data-oid="v_4:4lk"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="ocmvgf9"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="9o0wsny"
                >
                  <path
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                    data-oid=":lqb5tn"
                  />
                </svg>
              </div>
              {getFieldStatus("phone", phone) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="y33zzra"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="l:s3r3-"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="2slck0c"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="tio5odi"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="8xjn7yt"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="dncoc6."
                  />
                </svg>
                {errors.phone}
              </div>
            )}
            {!errors.phone && <div className="mt-2 h-5" data-oid="xf:_wi2" />}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="bg-white min-h-screen" data-oid=":fseh6y">
      {/* Page Header Section */}
      <div
        className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border-b border-blue-200 relative overflow-hidden"
        data-oid="zgdolhi"
      >
        {/* Subtle medical pattern background */}
        <div className="absolute inset-0 opacity-5" data-oid="-1mkyzw">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232563eb' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "40px 40px",
            }}
            data-oid="o3cw082"
          ></div>
        </div>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
          data-oid="-yabgo:"
        >
          <div className="text-center" data-oid="qv:ye1k">
            {/* Medical badge/credential indicator */}
            <div className="flex justify-center mb-6" data-oid="pi0:f.o">
              <div
                className="bg-white rounded-full p-4 shadow-lg border-2 border-blue-100"
                data-oid="_u6_ers"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                  data-oid="fe4jrha"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="4po4dus"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      data-oid="23ybklf"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1
              className="text-5xl font-bold text-gray-900 mb-4 tracking-tight"
              data-oid="a.88fig"
            >
              Sleep Apnea Risk Assessment
            </h1>

            <div className="max-w-4xl mx-auto mb-8" data-oid="-2fdg.f">
              <p
                className="text-xl text-gray-700 mb-4 leading-relaxed"
                data-oid="p5edinq"
              >
                Complete our clinically validated STOP-BANG questionnaire to
                assess your risk for obstructive sleep apnea. This
                evidence-based screening tool enables our dental professionals
                to provide you with personalized care recommendations.
              </p>

              <div
                className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-6"
                data-oid="1y__pxb"
              >
                <div className="flex items-center space-x-2" data-oid="z2sg.83">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    data-oid="hd93j-2"
                  ></div>
                  <span data-oid="mhqpe-t">Clinically Validated Tool</span>
                </div>
                <div className="flex items-center space-x-2" data-oid="a5ketv6">
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    data-oid="dl31q4h"
                  ></div>
                  <span data-oid=".de3qkd">5-10 Minutes to Complete</span>
                </div>
                <div className="flex items-center space-x-2" data-oid="l2zh-0k">
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    data-oid=".im8f12"
                  ></div>
                  <span data-oid="0_eh19n">Professional Review Included</span>
                </div>
              </div>
            </div>

            {/* Enhanced privacy and security section */}
            <div className="max-w-4xl mx-auto" data-oid="4digx47">
              <div className="grid md:grid-cols-3 gap-4" data-oid="edxyihh">
                {/* Privacy Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                  data-oid="-a0gj:-"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="54dzt09"
                  >
                    <div
                      className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="t.s1c:g"
                    >
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="w-v5oyd"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="o:rtzr3"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="9lld3jk"
                    >
                      HIPAA Protected
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="qox6jew">
                      Your health information is encrypted and protected
                      according to federal privacy standards.
                    </p>
                  </div>
                </div>

                {/* Medical Validation Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
                  data-oid="i_d2ci1"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="6da-zp7"
                  >
                    <div
                      className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="wo72cgr"
                    >
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="_m0z92n"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="7k9c:3:"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="j77-cbg"
                    >
                      Clinically Validated
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="zbvue2:">
                      STOP-BANG is a scientifically proven screening tool used
                      by medical professionals worldwide.
                    </p>
                  </div>
                </div>

                {/* Professional Review Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300"
                  data-oid="odhy6:q"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="9jyi-00"
                  >
                    <div
                      className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="d_u5rht"
                    >
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="sm4qj50"
                      >
                        <path
                          d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                          data-oid="x_pj1zm"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="w4a_2p_"
                    >
                      Expert Analysis
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="a:08nao">
                      Licensed dental professionals will review your results and
                      provide personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional credentials footer */}
              <div
                className="mt-8 pt-6 border-t border-gray-200"
                data-oid="kzkb4n1"
              >
                <div
                  className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500"
                  data-oid="yjetu6b"
                >
                  <div
                    className="flex items-center space-x-1"
                    data-oid=":kqqzkr"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="2_g3g9y"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                        data-oid="seftp_m"
                      />
                    </svg>
                    <span data-oid="nxrf-78">256-bit SSL Encryption</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="nntipbs"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="_68lh:4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="xfdkp26"
                      />
                    </svg>
                    <span data-oid="mfz.f8i">HIPAA Compliant Platform</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="rfw_fxm"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="rbt5vgj"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        data-oid="4si3c6r"
                      />
                    </svg>
                    <span data-oid="j0llsv9">Evidence-Based Medicine</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="6-wt5q4"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="y71dzb0"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                        data-oid="in584p_"
                      />
                    </svg>
                    <span data-oid="7bcy_wx">Licensed Professionals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        data-oid="asu8mb5"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
          noValidate
          data-oid="feg5s4."
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-6 z-10 mb-8"
            data-oid="lhr-uev"
          >
            <div
              className="flex justify-between items-center mb-3"
              data-oid="vcpu898"
            >
              <div className="flex items-center space-x-3" data-oid="3ikznw:">
                <div
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  data-oid="j6:j_-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="dr-kohi"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                      data-oid="fu7ha9q"
                    />
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold text-gray-900"
                  data-oid="l3tzumx"
                >
                  Assessment Progress
                </span>
              </div>
              <span
                className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                data-oid="4_gu82w"
              >
                Complete all sections
              </span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-3 mb-2"
              data-oid="615zc4p"
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 w-0"
                data-oid="a8gfmhv"
              ></div>
            </div>
            <p
              className="text-sm text-gray-600 flex items-center"
              data-oid="vjx-5pd"
            >
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="068jv_z"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                  data-oid="609ylms"
                />
              </svg>
              Answer all questions to receive your personalized STOP-BANG
              assessment
            </p>
          </div>

          <YesNoQuestion
            name="snoring"
            title="S - Snoring"
            description="Do you snore loudly (loud enough to be heard through closed doors or your bed-partner elbows you)?"
            data-oid="naki48o"
          />

          <YesNoQuestion
            name="tired"
            title="T - Tired"
            description="Do you often feel tired, fatigued, or sleepy during the day?"
            data-oid="bo5ch9g"
          />

          <YesNoQuestion
            name="observed"
            title="O - Observed"
            description="Has anyone observed you stop breathing or gasping during sleep?"
            data-oid=".gb_6e4"
          />

          <YesNoQuestion
            name="pressure"
            title="P - Pressure"
            description="Do you have or are you being treated for high blood pressure?"
            data-oid="m6-autm"
          />

          <BMISection data-oid="spqj2t." />

          <AgeInput data-oid="hc0l-zt" />

          <NeckSizeInput data-oid="sciqzb4" />

          <YesNoQuestion
            name="genderMale"
            title="G - Gender"
            description="Are you male?"
            data-oid="v1x7q.7"
          />

          <ContactFields data-oid="ib:ooin" />

          <div
            className="bg-gradient-to-br from-white to-blue-50 p-10 rounded-xl shadow-2xl border border-blue-100 relative overflow-hidden"
            data-oid="z_1av7-"
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" data-oid="6d8nrx0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "30px 30px",
                }}
                data-oid="0lx53wv"
              ></div>
            </div>

            <div className="relative z-10" data-oid="xb:r0jx">
              <div className="text-center mb-8" data-oid="kj_djo8">
                {/* Medical icon with professional styling */}
                <div
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  data-oid="rdj0b3z"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="_n3cimd"
                  >
                    <path
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      data-oid="-n5g22x"
                    />
                  </svg>
                </div>

                <h3
                  className="text-3xl font-bold text-gray-900 mb-3 tracking-tight"
                  data-oid="qmg:j61"
                >
                  Ready to Submit Your Assessment
                </h3>
                <p
                  className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
                  data-oid="_.p04:c"
                >
                  Please review your responses carefully before submitting. Our
                  dental professionals will analyze your results and provide
                  personalized recommendations for your sleep health.
                </p>
              </div>

              {/* Professional info cards */}
              <div
                className="grid md:grid-cols-3 gap-4 mb-8"
                data-oid="n_nrcp4"
              >
                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="rdgm3lc"
                >
                  <div
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="89bf0-k"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="0ag_y2u"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="n._lk2w"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="kcsl4ri"
                  >
                    HIPAA Compliant
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="fzce5fo">
                    Your data is protected
                  </p>
                </div>

                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="lhd3ltr"
                >
                  <div
                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="olfs3em"
                  >
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="pu9gfoa"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="ku3twq7"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="m.x0o01"
                  >
                    Clinically Validated
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="ffc.sl9">
                    Evidence-based screening
                  </p>
                </div>

                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="1sckcqz"
                >
                  <div
                    className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="7hhd4bq"
                  >
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="wmtsw8y"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                        data-oid="6:u5n:5"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="57q3:ya"
                  >
                    Expert Review
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="phim6g5">
                    Reviewed by specialists
                  </p>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
                data-oid="2.d-7f-"
              >
                <button
                  type="button"
                  onClick={restartSurvey}
                  className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center font-medium shadow-sm hover:shadow-md"
                  data-oid="ltgkexr"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="cg4vo1o"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                      data-oid="yg9yxtc"
                    />
                  </svg>
                  Start Over
                </button>

                <button
                  type="submit"
                  className="px-10 py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 text-lg transform hover:scale-105 focus:ring-4 focus:ring-blue-200"
                  data-oid="fl45n4i"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="1i-jtgo"
                  >
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      data-oid="z-zu95e"
                    />
                  </svg>
                  <span data-oid="my.jel5">Submit Assessment</span>
                </button>
              </div>

              {/* Professional footer with credentials */}
              <div className="pt-6 border-t border-blue-200" data-oid="cgj23me">
                <div className="text-center space-y-3" data-oid="xjfobv0">
                  <div
                    className="flex items-center justify-center space-x-2 text-sm text-gray-700"
                    data-oid="j7.uy9w"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="ziq4peq"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="y6cyeko"
                      />
                    </svg>
                    <span className="font-medium" data-oid="j6.btpw">
                      Secure Medical Assessment Platform
                    </span>
                  </div>

                  <p
                    className="text-xs text-gray-600 max-w-lg mx-auto"
                    data-oid="0wgereg"
                  >
                    This assessment will be reviewed by licensed dental
                    professionals. Results and recommendations will be provided
                    within 24-48 hours via secure communication.
                  </p>

                  <div
                    className="flex items-center justify-center space-x-4 text-xs text-gray-500"
                    data-oid="lap4lf_"
                  >
                    <span className="flex items-center" data-oid="d_07mc1">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="7-:ay89"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                          data-oid="qb-xhfh"
                        />
                      </svg>
                      SSL Encrypted
                    </span>
                    <span className="flex items-center" data-oid="y_-c3i5">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="97t-:9t"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="813wx_e"
                        />
                      </svg>
                      HIPAA Compliant
                    </span>
                    <span className="flex items-center" data-oid="ex2ilyh">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="jmn1rgm"
                      >
                        <path
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          data-oid="4ts8q3v"
                        />
                      </svg>
                      Clinically Validated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SleepApneaSurvey;
