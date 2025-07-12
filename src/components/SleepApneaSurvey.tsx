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
      className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen"
      data-oid="03t1rxy"
    >
      {/* Header Section */}
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 mb-8"
        data-oid="s083816"
      >
        <div
          className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-t-xl overflow-hidden"
          data-oid="c4p_u2."
        >
          {/* Sophisticated background pattern */}
          <div className="absolute inset-0 opacity-10" data-oid="bg-pattern">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "30px 30px",
              }}
              data-oid="rx4:zmp"
            ></div>
          </div>

          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"
            data-oid="gradient-overlay"
          ></div>

          <div className="relative z-10 p-8" data-oid="content-wrapper">
            <div
              className="flex items-start justify-between"
              data-oid="zjsiwk1"
            >
              {/* Left Section - Enhanced Title and Icon */}
              <div className="flex items-start space-x-6" data-oid="y-3ob6-">
                {/* Professional medical icon with enhanced styling */}
                <div
                  className="relative w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl"
                  data-oid="ms_q16:"
                >
                  {/* Inner glow effect */}
                  <div
                    className="absolute inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-xl"
                    data-oid="inner-glow"
                  ></div>

                  <svg
                    className="w-10 h-10 text-white relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="mc-yei4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      data-oid="7q5prly"
                    />
                  </svg>

                  {/* Subtle corner accent */}
                  <div
                    className="absolute top-2 right-2 w-2 h-2 bg-blue-300/40 rounded-full"
                    data-oid="corner-accent"
                  ></div>
                </div>

                <div
                  className="flex flex-col justify-center"
                  data-oid="g3mja8."
                >
                  {/* Enhanced typography hierarchy */}
                  <div className="mb-2" data-oid="title-section">
                    <h1
                      className="text-4xl font-bold text-white mb-1 tracking-tight leading-tight"
                      data-oid="9ex58wr"
                    >
                      STOP-BANG Assessment
                    </h1>
                    <div
                      className="text-2xl font-semibold text-blue-100 mb-1"
                      data-oid="results-text"
                    >
                      Clinical Results
                    </div>
                  </div>

                  <div
                    className="flex items-center space-x-3"
                    data-oid="subtitle-section"
                  >
                    <div
                      className="w-1 h-6 bg-gradient-to-b from-blue-300 to-blue-400 rounded-full"
                      data-oid="accent-line"
                    ></div>
                    <p
                      className="text-blue-200 text-lg font-medium tracking-wide"
                      data-oid="g7-3nnf"
                    >
                      Sleep Apnea Risk Evaluation Report
                    </p>
                  </div>

                  {/* Professional timestamp */}
                  <div
                    className="mt-3 flex items-center space-x-2 text-blue-300/80 text-sm"
                    data-oid="timestamp"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid=":birv:t"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        data-oid="ly9.d55"
                      />
                    </svg>
                    <span data-oid="tgmkrek">
                      Generated on{" "}
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Enhanced Patient Info Card */}
              <div
                className="relative bg-gradient-to-br from-white/15 to-white/5 rounded-2xl px-6 py-4 backdrop-blur-md border border-white/20 shadow-2xl min-w-[200px]"
                data-oid="nb7-f3o"
              >
                {/* Card header with icon */}
                <div
                  className="flex items-center justify-between mb-3"
                  data-oid="card-header"
                >
                  <div
                    className="text-xs text-blue-200 uppercase tracking-wider font-semibold flex items-center space-x-2"
                    data-oid="9ko8tn2"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="a0zo62y"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                        data-oid="fe9oxhw"
                      />
                    </svg>
                    <span data-oid="77rf_0d">Patient Information</span>
                  </div>

                  {/* Status indicator */}
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full shadow-lg"
                    data-oid="status-indicator"
                  ></div>
                </div>

                {/* Patient name with enhanced styling */}
                <div className="text-right" data-oid="patient-name-section">
                  <div
                    className="font-bold text-xl text-white mb-1 tracking-wide"
                    data-oid="9an149v"
                  >
                    {results.name}
                  </div>
                  <div
                    className="text-blue-200/80 text-sm font-medium"
                    data-oid="patient-id"
                  >
                    Assessment ID: #
                    {Math.random().toString(36).substr(2, 8).toUpperCase()}
                  </div>
                </div>

                {/* Subtle bottom accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/50 via-blue-300/50 to-transparent rounded-b-2xl"
                  data-oid="bottom-accent"
                ></div>
              </div>
            </div>
          </div>
        </div>
        =======
        {/* Score and Risk Level Section */}
        <div className="p-8" data-oid="7u4p6bc">
          <div className="grid lg:grid-cols-2 gap-10 mb-10" data-oid="vkny9va">
            {/* Score Display */}
            <div
              className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200 shadow-sm"
              data-oid="gfc7gx3"
            >
              <div className="text-center" data-oid=":gkaoss">
                <div
                  className="flex items-center justify-center mb-6"
                  data-oid="gdpvvkv"
                >
                  <div
                    className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3"
                    data-oid="by1end4"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="hb6:vxy"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        data-oid="oo7d5j."
                      />
                    </svg>
                  </div>
                  <h2
                    className="text-2xl font-bold text-slate-800"
                    data-oid="jbth00a"
                  >
                    Assessment Score
                  </h2>
                </div>

                <div className="relative inline-block mb-6" data-oid="njbwu0m">
                  {/* Main score circle */}
                  <div className="relative" data-oid="ftl3o_w">
                    <svg
                      className="w-40 h-40 transform -rotate-90"
                      viewBox="0 0 144 144"
                      data-oid="jr85bka"
                    >
                      {/* Background circle */}
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-200"
                        data-oid="r1rpi2-"
                      />

                      {/* Progress circle */}
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(results.score / 8) * 377} 377`}
                        className={classNames(
                          "transition-all duration-1000 ease-out",
                          results.riskLevel === "Low Risk"
                            ? "text-emerald-500"
                            : results.riskLevel === "Intermediate Risk"
                              ? "text-amber-500"
                              : "text-red-500",
                        )}
                        strokeLinecap="round"
                        data-oid="3.bsjnm"
                      />
                    </svg>

                    {/* Score text overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      data-oid="bo6kcqk"
                    >
                      <div className="text-center" data-oid="m7f2exw">
                        <div
                          className="text-5xl font-bold text-slate-800 mb-1"
                          data-oid="b8xqq7b"
                        >
                          {results.score}
                        </div>
                        <div
                          className="text-sm font-medium text-slate-500 uppercase tracking-wide"
                          data-oid="sguv_99"
                        >
                          out of 8
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Completion badge */}
                  <div
                    className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                    data-oid="-ro2kim"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="6r_6usi"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                        data-oid="x5986-v"
                      />
                    </svg>
                  </div>
                </div>

                {/* Score interpretation */}
                <div
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50"
                  data-oid="1_u4xgy"
                >
                  <p
                    className="text-sm text-slate-600 font-medium"
                    data-oid="hhj0cgi"
                  >
                    STOP-BANG Questionnaire Score
                  </p>
                  <p className="text-xs text-slate-500 mt-1" data-oid="2hn6..a">
                    Based on validated clinical assessment criteria
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Level Display */}
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm"
              data-oid="a6jlin:"
            >
              <div className="flex items-center mb-6" data-oid="6u1s8gy">
                <div
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3"
                  data-oid="lmwnoqc"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="bb8lrkw"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      data-oid="kc2v5ze"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-slate-800"
                  data-oid="h8uvds1"
                >
                  Risk Assessment
                </h2>
              </div>

              <div className="space-y-6" data-oid="srhojlr">
                {/* Main risk level card */}
                <div
                  className={classNames(
                    "relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300",
                    results.riskLevel === "Low Risk"
                      ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-100/50"
                      : results.riskLevel === "Intermediate Risk"
                        ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-amber-100/50"
                        : "bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-100/50",
                  )}
                  data-oid="izjri_y"
                >
                  {/* Background pattern */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-10"
                    data-oid="zxja0z-"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      data-oid="8k6vnv1"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="currentColor"
                        className={classNames(
                          results.riskLevel === "Low Risk"
                            ? "text-emerald-600"
                            : results.riskLevel === "Intermediate Risk"
                              ? "text-amber-600"
                              : "text-red-600",
                        )}
                        data-oid="q5i2p0n"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10" data-oid="0t-7rav">
                    <div
                      className="flex items-center justify-between mb-3"
                      data-oid="zyt.t8n"
                    >
                      <div
                        className="flex items-center space-x-3"
                        data-oid="7x:zv9n"
                      >
                        <div
                          className={classNames(
                            "w-4 h-4 rounded-full shadow-sm",
                            results.riskLevel === "Low Risk"
                              ? "bg-emerald-500"
                              : results.riskLevel === "Intermediate Risk"
                                ? "bg-amber-500"
                                : "bg-red-500",
                          )}
                          data-oid="g_leqa2"
                        ></div>
                        <div
                          className="flex flex-col"
                          data-oid="risk-text-container"
                        >
                          <span
                            className={classNames(
                              "text-xl font-bold leading-tight",
                              results.riskLevel === "Low Risk"
                                ? "text-emerald-800"
                                : results.riskLevel === "Intermediate Risk"
                                  ? "text-amber-800"
                                  : "text-red-800",
                            )}
                            data-oid="q8dtnzq"
                          >
                            {results.riskLevel}
                          </span>
                          <p
                            className={classNames(
                              "text-sm font-medium leading-tight",
                              results.riskLevel === "Low Risk"
                                ? "text-emerald-700"
                                : results.riskLevel === "Intermediate Risk"
                                  ? "text-amber-700"
                                  : "text-red-700",
                            )}
                            data-oid=".7:ahqi"
                            key="olk-KaGJ"
                          >
                            for Obstructive Sleep Apnea
                          </p>
                        </div>
                      </div>

                      {/* Risk level icon */}
                      <div
                        className={classNames(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          results.riskLevel === "Low Risk"
                            ? "bg-emerald-200"
                            : results.riskLevel === "Intermediate Risk"
                              ? "bg-amber-200"
                              : "bg-red-200",
                        )}
                        data-oid="_eu_wsi"
                      >
                        {results.riskLevel === "Low Risk" ? (
                          <svg
                            className="w-4 h-4 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="k3ty_26"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                              data-oid="xydr209"
                            />
                          </svg>
                        ) : results.riskLevel === "Intermediate Risk" ? (
                          <svg
                            className="w-4 h-4 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="z1u1acm"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                              data-oid="hlbsqg_"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="text-red-600 h-[17px] w-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="nwdbyvi"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                              data-oid="q5lt69n"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk level explanation */}
                <div
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                  data-oid="34:ctyl"
                >
                  <div
                    className="flex items-start space-x-3"
                    data-oid="y3ka1jo"
                  >
                    <div
                      className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5"
                      data-oid="gj1__3n"
                    >
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="3-.g3fb"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                          data-oid="-bc.kcy"
                        />
                      </svg>
                    </div>
                    <div data-oid="90:gv8w">
                      <h4
                        className="text-sm font-semibold text-slate-800 mb-1"
                        data-oid="26.4r-4"
                      >
                        Clinical Significance
                      </h4>
                      <p
                        className="text-xs text-slate-600 leading-relaxed"
                        data-oid="sg.r87n"
                      >
                        {results.riskLevel === "Low Risk" &&
                          "Lower probability of moderate to severe OSA. Continue monitoring symptoms."}
                        {results.riskLevel === "Intermediate Risk" &&
                          "Moderate probability of OSA. Clinical evaluation recommended."}
                        {results.riskLevel === "High Risk" &&
                          "High probability of OSA. Prompt medical evaluation strongly recommended."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Interpretation */}
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 mb-8 border border-slate-200 shadow-lg"
            data-oid="w.gaoqu"
          >
            {/* Header Section */}
            <div
              className="flex items-start justify-between mb-6"
              data-oid="header-section"
            >
              <div
                className="flex items-center space-x-4"
                data-oid="title-group"
              >
                <div
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                  data-oid="icon-container"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="hlt:ear"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      data-oid="ywbrk8p"
                    />
                  </svg>
                </div>
                <div data-oid="title-content">
                  <h3
                    className="text-2xl font-bold text-slate-900 mb-1"
                    data-oid="nx2c4ng"
                  >
                    Clinical Interpretation
                  </h3>
                  <p
                    className="text-sm text-slate-600 font-medium"
                    data-oid="subtitle"
                  >
                    Professional Assessment Based on STOP-BANG Criteria
                  </p>
                </div>
              </div>

              {/* Medical badge */}
              <div
                className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                data-oid="medical-badge"
              >
                <div
                  className="flex items-center space-x-2"
                  data-oid="badge-content"
                >
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    data-oid="status-dot"
                  ></div>
                  <span
                    className="text-xs font-semibold text-blue-700 uppercase tracking-wide"
                    data-oid="badge-text"
                  >
                    Clinical Grade
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Level Specific Content */}
            <div className="space-y-6" data-oid="lq.ep1w">
              {results.riskLevel === "Low Risk" && (
                <div
                  className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6"
                  data-oid="low-risk-section"
                >
                  <div
                    className="flex items-start space-x-4"
                    data-oid="low-risk-content"
                  >
                    <div
                      className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      data-oid="low-risk-icon"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="check-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                          data-oid=".ll6n0."
                        />
                      </svg>
                    </div>
                    <div data-oid="low-risk-text">
                      <h4
                        className="text-lg font-semibold text-emerald-900 mb-3"
                        data-oid="low-risk-title"
                      >
                        Low Risk Assessment
                      </h4>
                      <p
                        className="text-slate-700 leading-relaxed mb-4"
                        data-oid="yv7hhm4"
                      >
                        Your STOP-BANG assessment indicates a{" "}
                        <strong className="text-emerald-800" data-oid="9h9w_oi">
                          lower probability
                        </strong>{" "}
                        of moderate to severe obstructive sleep apnea (OSA).
                        This suggests that significant sleep-disordered
                        breathing is less likely based on current screening
                        criteria.
                      </p>
                      <div
                        className="bg-white/70 rounded-lg p-4 border border-emerald-100"
                        data-oid="low-risk-recommendations"
                      >
                        <h5
                          className="font-semibold text-slate-800 mb-2 flex items-center"
                          data-oid="rec-title"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="i8t0tfe"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                              data-oid="f55:iu1"
                            />
                          </svg>
                          Clinical Recommendations
                        </h5>
                        <p
                          className="text-sm text-slate-600 leading-relaxed"
                          data-oid="low-risk-rec-text"
                        >
                          Continue monitoring your sleep quality and discuss any
                          persistent symptoms such as excessive daytime
                          sleepiness, witnessed breathing interruptions, or
                          morning headaches with your healthcare provider.
                          Maintain good sleep hygiene practices.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.riskLevel === "Intermediate Risk" && (
                <div
                  className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6"
                  data-oid="intermediate-risk-section"
                >
                  <div
                    className="flex items-start space-x-4"
                    data-oid="intermediate-risk-content"
                  >
                    <div
                      className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      data-oid="intermediate-risk-icon"
                    >
                      <svg
                        className="w-4 h-4 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="warning-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                          data-oid="lwof3.u"
                        />
                      </svg>
                    </div>
                    <div data-oid="intermediate-risk-text">
                      <h4
                        className="text-lg font-semibold text-amber-900 mb-3"
                        data-oid="intermediate-risk-title"
                      >
                        Intermediate Risk Assessment
                      </h4>
                      <p
                        className="text-slate-700 leading-relaxed mb-4"
                        data-oid="::d-jf_"
                      >
                        Your STOP-BANG assessment suggests an{" "}
                        <strong className="text-amber-800" data-oid="s:ue.j0">
                          intermediate probability
                        </strong>{" "}
                        of moderate to severe obstructive sleep apnea. This
                        indicates a moderate likelihood of clinically
                        significant sleep-disordered breathing that warrants
                        further evaluation.
                      </p>
                      <div
                        className="bg-white/70 rounded-lg p-4 border border-amber-100"
                        data-oid="intermediate-risk-recommendations"
                      >
                        <h5
                          className="font-semibold text-slate-800 mb-2 flex items-center"
                          data-oid="2u08k:j"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="a3kol64"
                          >
                            <path
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              data-oid=".rgel:8"
                            />
                          </svg>
                          Clinical Recommendations
                        </h5>
                        <p
                          className="text-sm text-slate-600 leading-relaxed"
                          data-oid="intermediate-risk-rec-text"
                        >
                          We recommend scheduling a consultation with your
                          healthcare provider to discuss these results in
                          detail. Consider a comprehensive sleep evaluation,
                          which may include a sleep study (polysomnography) to
                          confirm diagnosis and assess severity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.riskLevel === "High Risk" && (
                <div
                  className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6"
                  data-oid="high-risk-section"
                >
                  <div
                    className="flex items-start space-x-4"
                    data-oid="high-risk-content"
                  >
                    <div
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      data-oid="high-risk-icon"
                    >
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="alert-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                          data-oid="61vuile"
                        />
                      </svg>
                    </div>
                    <div data-oid="high-risk-text">
                      <h4
                        className="text-lg font-semibold text-red-900 mb-3"
                        data-oid="high-risk-title"
                      >
                        High Risk Assessment
                      </h4>
                      <p
                        className="text-slate-700 leading-relaxed mb-4"
                        data-oid="l6apt0q"
                      >
                        Your STOP-BANG assessment indicates a{" "}
                        <strong className="text-red-800" data-oid="4p-sl_4">
                          high probability
                        </strong>{" "}
                        of moderate to severe obstructive sleep apnea. This
                        suggests a significant likelihood of clinically
                        important sleep-disordered breathing requiring prompt
                        medical attention.
                      </p>
                      <div
                        className="bg-white/70 rounded-lg p-4 border border-red-100"
                        data-oid="high-risk-recommendations"
                      >
                        <h5
                          className="font-semibold text-slate-800 mb-2 flex items-center"
                          data-oid="ws_xp0c"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="q-qviuz"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                              data-oid="t4o:t6f"
                            />
                          </svg>
                          Urgent Clinical Recommendations
                        </h5>
                        <p
                          className="text-sm text-slate-600 leading-relaxed"
                          data-oid="high-risk-rec-text"
                        >
                          We strongly recommend prompt consultation with your
                          healthcare provider for comprehensive evaluation. A
                          sleep study is likely indicated to confirm the
                          diagnosis and determine severity. Early intervention
                          can significantly improve health outcomes and quality
                          of life.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Footer */}
              <div
                className="bg-slate-100 rounded-lg p-4 border border-slate-200"
                data-oid="professional-footer"
              >
                <div
                  className="flex items-start space-x-3"
                  data-oid="footer-content"
                >
                  <div
                    className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5"
                    data-oid="footer-icon"
                  >
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="np2b.co"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                        data-oid="l-huv9."
                      />
                    </svg>
                  </div>
                  <div data-oid="footer-text">
                    <h5
                      className="text-sm font-semibold text-slate-800 mb-1"
                      data-oid="footer-title"
                    >
                      Important Medical Information
                    </h5>
                    <p
                      className="text-xs text-slate-600 leading-relaxed"
                      data-oid="footer-disclaimer"
                    >
                      This assessment is based on the validated STOP-BANG
                      questionnaire and provides risk stratification for
                      obstructive sleep apnea. It is intended for screening
                      purposes only and does not replace professional medical
                      evaluation. Individual risk factors and clinical
                      presentation should always be considered in conjunction
                      with these results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8"
            data-oid="1phir0b"
          >
            <div className="flex items-start space-x-4" data-oid="5l5tftu">
              <div
                className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                data-oid="v:ha8o5"
              >
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="ceil7mt"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    data-oid="0kkq:sq"
                  />
                </svg>
              </div>
              <div className="flex-1" data-oid="3x2uj6o">
                <h3
                  className="font-semibold text-blue-900 mb-3"
                  data-oid="xct0_gf"
                >
                  Understanding Sleep Apnea
                </h3>
                <p
                  className="text-slate-700 mb-3 leading-relaxed"
                  data-oid="5g9css4"
                >
                  Sleep apnea is more than just snoring—it's a serious medical
                  condition that can significantly impact your overall health,
                  affecting memory, energy levels, cardiovascular health, and
                  metabolic function.
                </p>
                <p
                  className="text-slate-700 leading-relaxed"
                  data-oid="ms9yt_l"
                >
                  At our practice, we take a comprehensive approach to patient
                  care, recognizing that
                  <strong className="text-blue-800" data-oid="hmj9o0n">
                    {" "}
                    airway health is fundamental to overall wellness
                  </strong>{" "}
                  and directly impacts dental health outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Risk Factors Section */}
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 mb-8 border border-slate-200 shadow-lg"
            data-oid="10y22jh"
          >
            {/* Header Section */}
            <div
              className="flex items-start justify-between mb-6"
              data-oid="x1b2pdi"
            >
              <div className="flex items-center space-x-4" data-oid="c7w68i7">
                <div
                  className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg"
                  data-oid="9v-k6b2"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="rdk.utw"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      data-oid="sh7l0f-"
                    />
                  </svg>
                </div>
                <div data-oid="f.ofa5h">
                  <h3
                    className="text-2xl font-bold text-slate-900 mb-1"
                    data-oid="3ks0fso"
                  >
                    Additional Clinical Considerations
                  </h3>
                  <p
                    className="text-sm text-slate-600 font-medium"
                    data-oid="yyf1ua6"
                  >
                    Comprehensive Risk Factor Assessment
                  </p>
                </div>
              </div>

              {/* Optional badge */}
              <div
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                data-oid="optional-badge"
              >
                <div className="flex items-center space-x-2" data-oid="nf7haic">
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full"
                    data-oid="2j7i-:_"
                  ></div>
                  <span
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
                    data-oid="_8cfia."
                  >
                    Optional
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
              data-oid="description-section"
            >
              <div
                className="flex items-start space-x-3"
                data-oid="description-content"
              >
                <div
                  className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5"
                  data-oid="info-icon"
                >
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="sy11kgc"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                      data-oid="fge3wi6"
                    />
                  </svg>
                </div>
                <div data-oid="description-text">
                  <p
                    className="text-sm text-blue-800 font-medium mb-1"
                    data-oid="lpjcrm_"
                  >
                    Enhanced Clinical Assessment
                  </p>
                  <p
                    className="text-xs text-blue-700 leading-relaxed"
                    data-oid="description-detail"
                  >
                    Please indicate any additional factors that may be relevant
                    to your sleep health assessment. This information helps our
                    clinical team provide more personalized recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6" data-oid="n1iqcem">
              {/* General Risk Factors */}
              <div data-oid="general-factors-section">
                <div
                  className="flex items-center space-x-3 mb-4"
                  data-oid="section-header"
                >
                  <div
                    className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"
                    data-oid="section-icon"
                  >
                    <svg
                      className="w-4 h-4 text-slate-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="gqh9z_:"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                        data-oid="qhow15w"
                      />
                    </svg>
                  </div>
                  <h4
                    className="text-lg font-semibold text-slate-800"
                    data-oid="section-title"
                  >
                    General Risk Factors
                  </h4>
                </div>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  data-oid="uvyakwp"
                >
                  {[
                    {
                      text: "Depression or mood disorders",
                      category: "mental-health",
                    },
                    { text: "Anxiety disorders", category: "mental-health" },
                    { text: "Chronic pain conditions", category: "physical" },
                    {
                      text: "Memory or concentration difficulties",
                      category: "cognitive",
                    },
                    { text: "ADHD/ADD diagnosis", category: "cognitive" },
                    {
                      text: "Family history of sleep apnea",
                      category: "genetic",
                    },
                    { text: "Chronic dry mouth", category: "physical" },
                    {
                      text: "Frequent morning headaches",
                      category: "physical",
                    },
                    {
                      text: "High caffeine dependency (>2 cups/day)",
                      category: "lifestyle",
                    },
                    {
                      text: "Regular sleep medication use",
                      category: "medication",
                    },
                    {
                      text: "Difficulty with weight management",
                      category: "lifestyle",
                    },
                  ].map((factor, index) => (
                    <label
                      key={index}
                      className="group flex items-start space-x-3 cursor-pointer hover:bg-white p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-md"
                      data-oid="yj1g58:"
                    >
                      <div className="relative" data-oid="checkbox-container">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded-md focus:ring-blue-500 focus:ring-2 mt-0.5 transition-all duration-200"
                          data-oid=".l:l.4c"
                        />

                        <div
                          className="absolute inset-0 rounded-md bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          data-oid="hover-bg"
                        ></div>
                      </div>

                      <div className="flex-1" data-oid="factor-content">
                        <span
                          className="text-slate-700 text-sm font-medium leading-relaxed block"
                          data-oid="qh_5xqw"
                        >
                          {factor.text}
                        </span>
                        <div
                          className="flex items-center mt-1"
                          data-oid="category-indicator"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              factor.category === "mental-health"
                                ? "bg-purple-400"
                                : factor.category === "physical"
                                  ? "bg-red-400"
                                  : factor.category === "cognitive"
                                    ? "bg-blue-400"
                                    : factor.category === "genetic"
                                      ? "bg-green-400"
                                      : factor.category === "lifestyle"
                                        ? "bg-orange-400"
                                        : "bg-gray-400"
                            }`}
                            data-oid="category-dot"
                          ></div>
                          <span
                            className="text-xs text-slate-500 capitalize"
                            data-oid="category-label"
                          >
                            {factor.category.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Female-Specific Section */}
              <div
                className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6"
                data-oid="bdg2q4e"
              >
                <div
                  className="flex items-center space-x-3 mb-4"
                  data-oid="female-section-header"
                >
                  <div
                    className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center"
                    data-oid="female-section-icon"
                  >
                    <svg
                      className="w-4 h-4 text-pink-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="pzonzha"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        data-oid="zw3jju9"
                      />
                    </svg>
                  </div>
                  <h4
                    className="text-lg font-semibold text-pink-900"
                    data-oid="qq72szf"
                  >
                    Female-Specific Risk Factors
                  </h4>
                </div>

                <div className="space-y-3" data-oid="3gtxied">
                  {[
                    {
                      text: "Polycystic Ovarian Syndrome (PCOS)",
                      description:
                        "Hormonal disorder affecting reproductive health",
                    },
                    {
                      text: "Post-menopausal status",
                      description: "Hormonal changes after menopause",
                    },
                  ].map((factor, index) => (
                    <label
                      key={index}
                      className="group flex items-start space-x-3 cursor-pointer hover:bg-white/70 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-pink-200 hover:shadow-md"
                      data-oid="xnk9mho"
                    >
                      <div
                        className="relative"
                        data-oid="female-checkbox-container"
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-pink-600 bg-white border-pink-300 rounded-md focus:ring-pink-500 focus:ring-2 mt-0.5 transition-all duration-200"
                          data-oid="b5-p:74"
                        />

                        <div
                          className="absolute inset-0 rounded-md bg-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          data-oid="female-hover-bg"
                        ></div>
                      </div>

                      <div className="flex-1" data-oid="female-factor-content">
                        <span
                          className="text-slate-700 text-sm font-medium leading-relaxed block"
                          data-oid="w.4jyzq"
                        >
                          {factor.text}
                        </span>
                        <p
                          className="text-xs text-slate-600 mt-1 leading-relaxed"
                          data-oid="factor-description"
                        >
                          {factor.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Privacy Note */}
            <div
              className="mt-8 pt-6 border-t border-slate-200"
              data-oid="wwbu2gz"
            >
              <div
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                data-oid="privacy-section"
              >
                <div className="flex items-start space-x-3" data-oid="uwutnqy">
                  <div
                    className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5"
                    data-oid="privacy-icon"
                  >
                    <svg
                      className="w-3 h-3 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="kmezx5k"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        data-oid="jskqvkd"
                      />
                    </svg>
                  </div>
                  <div data-oid="privacy-content">
                    <h5
                      className="text-sm font-semibold text-slate-800 mb-1"
                      data-oid="privacy-title"
                    >
                      Confidential Medical Information
                    </h5>
                    <p
                      className="text-xs text-slate-600 leading-relaxed"
                      data-oid="fe9-w-1"
                    >
                      <strong className="text-slate-700" data-oid="dm2hzhe">
                        Privacy Assurance:
                      </strong>{" "}
                      All responses are encrypted and shared confidentially with
                      our licensed clinical team to provide personalized care
                      recommendations and ensure comprehensive treatment
                      planning. Your information is protected under HIPAA
                      regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
            data-oid="k:dy4ra"
          >
            <h3
              className="text-lg font-semibold text-blue-900 mb-4 flex items-center"
              data-oid="9ovz5zi"
            >
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid=".foi00q"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  data-oid="0.6klpw"
                />
              </svg>
              Recommended Next Steps
            </h3>
            <div className="space-y-3" data-oid="pu::7v2">
              <div className="flex items-start space-x-3" data-oid="5pkbu5:">
                <div
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
                  data-oid="90gnq9k"
                >
                  1
                </div>
                <p className="text-blue-800 leading-relaxed" data-oid="xzfku96">
                  A licensed healthcare professional from our team will contact
                  you within 24-48 hours to discuss your results.
                </p>
              </div>
              <div className="flex items-start space-x-3" data-oid="p-uzmq:">
                <div
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
                  data-oid="i3maa_z"
                >
                  2
                </div>
                <p className="text-blue-800 leading-relaxed" data-oid="8.1ezkk">
                  We will review your medical history and current symptoms to
                  develop a personalized care plan.
                </p>
              </div>
              <div className="flex items-start space-x-3" data-oid="-hcajb4">
                <div
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
                  data-oid="7a4kuu1"
                >
                  3
                </div>
                <p className="text-blue-800 leading-relaxed" data-oid=":lms4ma">
                  If indicated, we will coordinate appropriate referrals and
                  treatment options tailored to your needs.
                </p>
              </div>
            </div>
          </div>

          {/* Email Results Option - Enhanced Professional Design */}
          <div className="mb-8" data-oid="h5xd6j2">
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              data-oid="email-results-container"
            >
              {/* Header Section */}
              <div
                className="flex items-center justify-between mb-4"
                data-oid="email-header"
              >
                <div
                  className="flex items-center space-x-3"
                  data-oid="header-content"
                >
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md"
                    data-oid="email-icon-container"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="email-icon"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        data-oid="email-path"
                      />
                    </svg>
                  </div>
                  <div data-oid="header-text">
                    <h3
                      className="text-lg font-semibold text-slate-900"
                      data-oid="email-title"
                    >
                      Digital Report Delivery
                    </h3>
                    <p
                      className="text-sm text-slate-600"
                      data-oid="email-subtitle"
                    >
                      Secure and convenient access to your results
                    </p>
                  </div>
                </div>

                {/* Professional badge */}
                <div
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5"
                  data-oid="professional-badge"
                >
                  <div
                    className="flex items-center space-x-2"
                    data-oid="n_ctd1q"
                  >
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      data-oid="c:xa74f"
                    ></div>
                    <span
                      className="text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      data-oid="4csi89r"
                    >
                      Optional
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Checkbox Option */}
              <label
                className="group flex items-start space-x-4 cursor-pointer p-4 rounded-xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
                data-oid="ar5pwga"
              >
                <div className="relative mt-1" data-oid="ynnmw6b">
                  <input
                    type="checkbox"
                    checked={emailResults}
                    onChange={(e) => setEmailResults(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded-md focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                    data-oid="cmk3r11"
                  />

                  {/* Custom checkbox enhancement */}
                  <div
                    className="absolute inset-0 rounded-md bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    data-oid="checkbox-hover-bg"
                  ></div>
                </div>

                <div className="flex-1" data-oid="checkbox-content">
                  <div
                    className="flex items-center space-x-3 mb-2"
                    data-oid="main-option"
                  >
                    <span
                      className="text-slate-900 font-semibold text-base"
                      data-oid="main-text"
                    >
                      Email me a secure copy of my assessment results
                    </span>

                    {/* Security indicator */}
                    <div
                      className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full"
                      data-oid="security-indicator"
                    >
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="security-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="security-path"
                        />
                      </svg>
                      <span
                        className="text-xs font-medium text-green-700"
                        data-oid="security-text"
                      >
                        Encrypted
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-sm text-slate-600 leading-relaxed"
                    data-oid="exum5yl"
                  >
                    Receive a comprehensive PDF report with your STOP-BANG
                    assessment results, clinical interpretation, and
                    personalized recommendations delivered securely to your
                    inbox.
                  </p>

                  {/* Feature highlights */}
                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    data-oid="feature-highlights"
                  >
                    {[
                      { icon: "📊", text: "Detailed Analysis" },
                      { icon: "🔒", text: "HIPAA Compliant" },
                      { icon: "📱", text: "Mobile Friendly" },
                      { icon: "💾", text: "Downloadable PDF" },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-md"
                        data-oid={`feature-${index}`}
                      >
                        <span
                          className="text-xs"
                          data-oid={`feature-icon-${index}`}
                        >
                          {feature.icon}
                        </span>
                        <span
                          className="text-xs font-medium text-slate-700"
                          data-oid={`feature-text-${index}`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </label>

              {/* Enhanced Confirmation Message */}
              {emailResults && (
                <div
                  className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                  data-oid="1a3cl1x"
                >
                  <div
                    className="flex items-start space-x-3"
                    data-oid="confirmation-content"
                  >
                    <div
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      data-oid="confirmation-icon-container"
                    >
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="bhoavw8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                          data-oid="5724366"
                        />
                      </svg>
                    </div>
                    <div
                      className="flex-1"
                      data-oid="confirmation-text-container"
                    >
                      <h4
                        className="text-sm font-semibold text-blue-900 mb-1"
                        data-oid="confirmation-title"
                      >
                        Email Delivery Confirmed
                      </h4>
                      <p
                        className="text-sm text-blue-700 leading-relaxed mb-2"
                        data-oid="rq06w7r"
                      >
                        Your comprehensive assessment report will be securely
                        delivered to your registered email address within 24-48
                        hours.
                      </p>

                      {/* Delivery timeline */}
                      <div
                        className="bg-white/70 rounded-lg p-3 border border-blue-100"
                        data-oid="delivery-timeline"
                      >
                        <div
                          className="flex items-center justify-between text-xs"
                          data-oid="timeline-content"
                        >
                          <div
                            className="flex items-center space-x-2"
                            data-oid="timeline-step-1"
                          >
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              data-oid="step-1-dot"
                            ></div>
                            <span
                              className="text-blue-700 font-medium"
                              data-oid="step-1-text"
                            >
                              Assessment Complete
                            </span>
                          </div>
                          <div
                            className="flex-1 h-px bg-blue-200 mx-2"
                            data-oid="timeline-line"
                          ></div>
                          <div
                            className="flex items-center space-x-2"
                            data-oid="timeline-step-2"
                          >
                            <div
                              className="w-2 h-2 bg-blue-300 rounded-full"
                              data-oid="step-2-dot"
                            ></div>
                            <span
                              className="text-blue-600"
                              data-oid="step-2-text"
                            >
                              Professional Review
                            </span>
                          </div>
                          <div
                            className="flex-1 h-px bg-blue-200 mx-2"
                            data-oid="timeline-line-2"
                          ></div>
                          <div
                            className="flex items-center space-x-2"
                            data-oid="timeline-step-3"
                          >
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
                              data-oid="step-3-dot"
                            ></div>
                            <span
                              className="text-green-700 font-medium"
                              data-oid="step-3-text"
                            >
                              Email Delivered
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div
                className="mt-4 pt-4 border-t border-slate-200"
                data-oid="privacy-notice"
              >
                <div className="flex items-start space-x-2" data-oid="0oxs.u_">
                  <svg
                    className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="cfod0_0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                      data-oid="privacy-path"
                    />
                  </svg>
                  <p
                    className="text-xs text-slate-600 leading-relaxed"
                    data-oid="privacy-text"
                  >
                    <strong
                      className="text-slate-700"
                      data-oid="privacy-emphasis"
                    >
                      Privacy Protected:
                    </strong>
                    All email communications are encrypted and comply with HIPAA
                    regulations. Your assessment results will only be shared
                    with you and our licensed clinical team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Professional Action Buttons */}
          <div className="mb-8" data-oid="h-upvrv">
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 shadow-lg"
              data-oid="action-buttons-container"
            >
              {/* Header Section */}
              <div className="text-center mb-6" data-oid="action-header">
                <div
                  className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  data-oid="action-icon-container"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="action-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      data-oid="action-path"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-bold text-slate-900 mb-2"
                  data-oid="action-title"
                >
                  Assessment Actions
                </h3>
                <p
                  className="text-sm text-slate-600"
                  data-oid="action-subtitle"
                >
                  Choose how you'd like to proceed with your results
                </p>
              </div>

              {/* Action Buttons Grid */}
              <div
                className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto"
                data-oid="action-buttons-grid"
              >
                {/* Print Report Button */}
                <div
                  className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg"
                  data-oid="print-button-container"
                >
                  <button
                    onClick={() => window.print()}
                    className="w-full p-6 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 transition-all duration-300 flex flex-col items-center text-center group-hover:scale-[1.02] transform"
                    data-oid="mldwcg8"
                  >
                    {/* Icon Container */}
                    <div
                      className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-md"
                      data-oid="print-icon-container"
                    >
                      <svg
                        className="w-7 h-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        data-oid="-jmb_u3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          data-oid="g_g2jur"
                        />
                      </svg>
                    </div>

                    {/* Button Content */}
                    <div data-oid="print-button-content">
                      <h4
                        className="text-lg font-semibold text-slate-900 mb-2"
                        data-oid="print-title"
                      >
                        Print Report
                      </h4>
                      <p
                        className="text-sm text-slate-600 leading-relaxed mb-3"
                        data-oid="print-description"
                      >
                        Generate a professional PDF copy of your complete
                        assessment results
                      </p>

                      {/* Feature badges */}
                      <div
                        className="flex flex-wrap justify-center gap-2"
                        data-oid="print-features"
                      >
                        <span
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium"
                          data-oid="print-feature-1"
                        >
                          📄 PDF Format
                        </span>
                        <span
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium"
                          data-oid="print-feature-2"
                        >
                          🖨️ Print Ready
                        </span>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      data-oid="print-hover-indicator"
                    ></div>
                  </button>
                </div>

                {/* New Assessment Button */}
                <div
                  className="group relative overflow-hidden rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                  data-oid="restart-button-container"
                >
                  <button
                    onClick={restartSurvey}
                    className="w-full p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-all duration-300 flex flex-col items-center text-center group-hover:scale-[1.02] transform"
                    data-oid="mrad_xd"
                  >
                    {/* Icon Container */}
                    <div
                      className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-md"
                      data-oid="restart-icon-container"
                    >
                      <svg
                        className="w-7 h-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        data-oid="ypt__0n"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          data-oid="g476ivt"
                        />
                      </svg>
                    </div>

                    {/* Button Content */}
                    <div data-oid="restart-button-content">
                      <h4
                        className="text-lg font-semibold text-slate-900 mb-2"
                        data-oid="restart-title"
                      >
                        New Assessment
                      </h4>
                      <p
                        className="text-sm text-slate-600 leading-relaxed mb-3"
                        data-oid="restart-description"
                      >
                        Start fresh with a new STOP-BANG assessment
                        questionnaire
                      </p>

                      {/* Feature badges */}
                      <div
                        className="flex flex-wrap justify-center gap-2"
                        data-oid="restart-features"
                      >
                        <span
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium"
                          data-oid="restart-feature-1"
                        >
                          🔄 Fresh Start
                        </span>
                        <span
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium"
                          data-oid="restart-feature-2"
                        >
                          📋 New Form
                        </span>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      data-oid="restart-hover-indicator"
                    ></div>
                  </button>
                </div>
              </div>

              {/* Additional Options */}
              <div
                className="mt-6 pt-6 border-t border-slate-200"
                data-oid="additional-options"
              >
                <div
                  className="text-center"
                  data-oid="additional-options-content"
                >
                  <p
                    className="text-sm text-slate-600 mb-4"
                    data-oid="additional-options-text"
                  >
                    Need help or have questions about your results?
                  </p>

                  <div
                    className="flex flex-wrap justify-center gap-3"
                    data-oid="help-options"
                  >
                    <button
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg"
                      data-oid="scroll-to-top"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        data-oid="scroll-icon"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                          data-oid="scroll-path"
                        />
                      </svg>
                      <span data-oid="scroll-text">Back to Top</span>
                    </button>

                    <button
                      onClick={() => {
                        const element = document.querySelector(
                          '[data-oid="email-results-container"]',
                        );
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-lg"
                      data-oid="email-options"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        data-oid="m3m4um:"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          data-oid="jse6qba"
                        />
                      </svg>
                      <span data-oid="email-text">Email Options</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Professional Footer */}
              <div
                className="mt-6 pt-4 border-t border-slate-200"
                data-oid="action-footer"
              >
                <div
                  className="flex items-center justify-center space-x-2 text-xs text-slate-500"
                  data-oid="action-footer-content"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="8m7szpv"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                      data-oid="ca_u_u5"
                    />
                  </svg>
                  <span data-oid="k2r29ql">
                    All actions are secure and HIPAA compliant
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Disclaimer */}
          <div className="border-t border-slate-200 pt-6" data-oid="qsjx0t7">
            <div
              className="bg-amber-50 border border-amber-200 rounded-lg p-4"
              data-oid="prubqce"
            >
              <div className="flex items-start space-x-3" data-oid="arp:4.r">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="xsu_mpm"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    data-oid="h5az6v."
                  />
                </svg>
                <div data-oid=":i24g0u">
                  <h4
                    className="font-semibold text-amber-800 mb-1"
                    data-oid="a5r7l.b"
                  >
                    Medical Disclaimer
                  </h4>
                  <p
                    className="text-sm text-amber-700 leading-relaxed"
                    data-oid=".n9zhhp"
                  >
                    This STOP-BANG assessment is a validated screening tool for
                    educational and preliminary evaluation purposes only. It
                    does not constitute a medical diagnosis and should not
                    replace professional medical consultation. Please consult
                    with a qualified healthcare provider for proper diagnosis,
                    treatment recommendations, and medical advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Show results if survey is completed
  if (showResults && surveyResults) {
    return <ResultsDisplay results={surveyResults} data-oid=".1dn7-5" />;
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
        data-oid="y4v2ot-"
      >
        <div
          className="flex items-start justify-between mb-2"
          data-oid="ihq1jl1"
        >
          <h3
            className="text-lg font-semibold text-gray-900"
            data-oid="798u7ac"
          >
            {title}
          </h3>
          {isAnswered && (
            <div
              className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full"
              data-oid="y_._puv"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="zx46fa:"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                  data-oid=":nff89-"
                />
              </svg>
              Answered
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4" data-oid="s:asnto">
          {description}
        </p>

        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value) => value !== null || "This question is required",
          }}
          render={({ field }) => (
            <div className="flex space-x-4" data-oid="fizbvam">
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
                data-oid="g9l2tem"
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
                  data-oid="miqyx2_"
                />

                <div
                  className={classNames(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    {
                      "border-green-500 bg-green-500": field.value === true,
                      "border-gray-400": field.value !== true,
                    },
                  )}
                  data-oid="-5mm5oo"
                >
                  {field.value === true && (
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-pulse"
                      data-oid="fkzs15t"
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
                  data-oid="2vdbm6s"
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
                data-oid="1jyw5l."
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
                  data-oid="7c81t1d"
                />

                <div
                  className={classNames(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    {
                      "border-red-500 bg-red-500": field.value === false,
                      "border-gray-400": field.value !== false,
                    },
                  )}
                  data-oid="t6zceda"
                >
                  {field.value === false && (
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-pulse"
                      data-oid="l.kgybs"
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
                  data-oid="44.mr__"
                >
                  No
                </span>
              </label>
            </div>
          )}
          data-oid="k881as4"
        />

        {errors[name] && (
          <div
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"
            data-oid="ci3wh8w"
          >
            <p
              className="text-sm text-red-600 flex items-center"
              data-oid="k-of_su"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="jds9xkq"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                  data-oid="j4anmzz"
                />
              </svg>
              {errors[name]?.message}
            </p>
          </div>
        )}
        {!errors[name] && <div className="mt-3 h-0" data-oid="0mn0a-i" />}
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
        data-oid="dyoup6m"
      >
        <h3
          className="text-lg font-semibold text-gray-900 mb-2"
          data-oid="qe6eevt"
        >
          BMI Calculator
        </h3>
        <p className="text-gray-600 mb-4" data-oid="ivxegrk">
          Calculate your BMI to determine if it's over 35.
        </p>

        <div className="mb-4" data-oid="xirhzwy">
          <p
            className="text-sm font-medium text-gray-700 mb-2"
            data-oid="n38mt9s"
          >
            Select units:
          </p>
          <div className="flex space-x-4" data-oid="4cpfj4r">
            <label
              className="flex items-center space-x-2 cursor-pointer"
              data-oid="tkgkvj8"
            >
              <input
                type="radio"
                checked={units === "metric"}
                onChange={() => setUnits("metric")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                data-oid="pi5dlad"
              />

              <span className="text-gray-900" data-oid="oizzeja">
                cm / kg
              </span>
            </label>
            <label
              className="flex items-center space-x-2 cursor-pointer"
              data-oid="_fs9aan"
            >
              <input
                type="radio"
                checked={units === "imperial"}
                onChange={() => setUnits("imperial")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                data-oid="xging:."
              />

              <span className="text-gray-900" data-oid="90j7nfa">
                in / lb
              </span>
            </label>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          data-oid="9pqz7g4"
        >
          <div data-oid="i8snnza">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              data-oid="uo_k_e_"
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
              data-oid=":c0qouh"
            />
          </div>

          <div data-oid="9dhsbp9">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              data-oid="frz5xz-"
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
              data-oid="e-xiol2"
            />
          </div>
        </div>

        <div className="mb-4" data-oid="b-d79px">
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
            data-oid="s1jwsge"
          >
            Calculate BMI
          </button>
          {showBMI && (
            <button
              type="button"
              onClick={resetCalculator}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              data-oid="jug:xja"
            >
              Reset
            </button>
          )}
        </div>

        {showBMI && localBMI && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4" data-oid="2yj7mxw">
            <p className="text-sm font-medium text-blue-900" data-oid="y80eiw9">
              Your BMI:{" "}
              <span className="text-lg font-bold" data-oid="zkyfujk">
                {localBMI}
              </span>
            </p>
            <p className="text-sm text-blue-700 mt-1" data-oid="otvki56">
              BMI over 35:{" "}
              <span className="font-semibold" data-oid="38117x9">
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
            data-oid="dy3q:cq"
          />

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6"
            data-oid="rkmgs6e"
          >
            <h3
              className="text-lg font-semibold text-gray-900 mb-2"
              data-oid="xyez0yu"
            >
              BMI &gt; 35
            </h3>
            <p className="text-gray-600 mb-4" data-oid="sd-oq46">
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
                <div className="flex space-x-4" data-oid="amhkqma">
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
                    data-oid="vn9c..b"
                  >
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => !isDisabled && field.onChange(true)}
                      disabled={isDisabled}
                      className="sr-only"
                      data-oid="isy8qq1"
                    />

                    <div
                      className={classNames(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        {
                          "border-green-500 bg-green-500": field.value === true,
                          "border-gray-300": field.value !== true,
                        },
                      )}
                      data-oid="_mt:fhd"
                    >
                      {field.value === true && (
                        <div
                          className="w-2 h-2 bg-white rounded-full"
                          data-oid="pzm-8vh"
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-gray-900"
                      data-oid="-z.v1aa"
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
                    data-oid="dl7.:fc"
                  >
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => !isDisabled && field.onChange(false)}
                      disabled={isDisabled}
                      className="sr-only"
                      data-oid="gwcrs9-"
                    />

                    <div
                      className={classNames(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        {
                          "border-red-500 bg-red-500": field.value === false,
                          "border-gray-300": field.value !== false,
                        },
                      )}
                      data-oid="rn0rmtr"
                    >
                      {field.value === false && (
                        <div
                          className="w-2 h-2 bg-white rounded-full"
                          data-oid="nkyhyzi"
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-gray-900"
                      data-oid="6rp-u32"
                    >
                      No
                    </span>
                  </label>
                </div>
              )}
              data-oid="xn-87o6"
            />

            {errors.bmiOver35 && (
              <div className="mt-2 h-6" data-oid="qqm3-r3">
                <p className="text-sm text-red-600" data-oid="wsxpud7">
                  {errors.bmiOver35?.message}
                </p>
              </div>
            )}
            {!errors.bmiOver35 && (
              <div className="mt-2 h-6" data-oid="5v7xixe" />
            )}

            {bmiCalculated && (
              <p className="text-xs text-gray-500 mt-2" data-oid="m75enki">
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
      data-oid=".4f17uw"
    />
  ));

  const AgeInput: React.FC = React.memo(() => (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      data-oid="0zik20:"
    >
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-oid="ebndi14"
      >
        Age
      </h3>
      <p className="text-gray-600 mb-4" data-oid="kzzzqt_">
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
            data-oid="a21kg9s"
          />
        )}
        data-oid="eote.hs"
      />

      {errors.age && (
        <p className="mb-4 text-sm text-red-600" data-oid="5ch_vu0">
          {errors.age.message}
        </p>
      )}

      <YesNoQuestion
        name="ageOver50"
        title="Age > 50"
        description="Are you over 50 years old?"
        disabled={true}
        data-oid="sgtzzar"
      />
    </div>
  ));

  const NeckSizeInput: React.FC = React.memo(() => (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      data-oid="pz4z3h7"
    >
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-oid="5v7ujoc"
      >
        Neck Size
      </h3>
      <p className="text-gray-600 mb-4" data-oid="u_wx67u">
        Please measure your neck circumference.
      </p>

      <div className="flex space-x-2 mb-4" data-oid="5_rcv0c">
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
              data-oid="-:5e8dt"
            />
          )}
          data-oid="3921vr3"
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
              data-oid="x54qhtr"
            >
              <option value="inches" data-oid="-lh:izh">
                inches
              </option>
              <option value="cm" data-oid="5oo-c:3">
                cm
              </option>
            </select>
          )}
          data-oid="rd3xkym"
        />
      </div>
      {errors.neckSize && (
        <p className="mb-4 text-sm text-red-600" data-oid="e2z0fub">
          {errors.neckSize.message}
        </p>
      )}

      <YesNoQuestion
        name="neckSizeOver16"
        title="Neck Size > 16 inches"
        description="Is your neck circumference greater than 16 inches (40cm)?"
        disabled={true}
        data-oid="1ilgfac"
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
        data-oid="6j1:zix"
      >
        <div className="flex items-center mb-4" data-oid="6f4-m6q">
          <div
            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
            data-oid="m2.pwl-"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              data-oid="_eza.lz"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
                data-oid="ty28dq-"
              />
            </svg>
          </div>
          <div data-oid="1rwdv9r">
            <h3
              className="text-lg font-semibold text-gray-900"
              data-oid="vy5mk6j"
            >
              Contact Information
            </h3>
            <p className="text-gray-600 text-sm" data-oid="gfee:_l">
              Your details are kept confidential and secure
            </p>
          </div>
        </div>

        <div className="space-y-6" data-oid="oahmsy3">
          <div data-oid="gw.ko2z">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="7th:njy"
            >
              Full Name *
            </label>
            <div className="relative" data-oid="dzm::ml">
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
                data-oid="hv0cyih"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="l8iqd:5"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="5zjiw.w"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                    data-oid=".wurc0t"
                  />
                </svg>
              </div>
              {getFieldStatus("fullName", fullName) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="mpr9j3a"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="n5lfr-o"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="edc48:n"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.fullName && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid=":wb8gy1"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="x6277b4"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="9i5t8ig"
                  />
                </svg>
                {errors.fullName}
              </div>
            )}
            {!errors.fullName && (
              <div className="mt-2 h-5" data-oid=".i-q7wr" />
            )}
          </div>

          <div data-oid="4:765vc">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="fln7jdt"
            >
              Email Address *
            </label>
            <div className="relative" data-oid="3ehn-nc">
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
                data-oid="-30c-nw"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="fhsd8n6"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="wvrzn5s"
                >
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    data-oid="j5h0b6t"
                  />

                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    data-oid="r7ljr4b"
                  />
                </svg>
              </div>
              {getFieldStatus("email", email) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="sa40m0."
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="9:ngbf-"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="c_7fh-7"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="dpg0g6u"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="b-cmapp"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="bg9braz"
                  />
                </svg>
                {errors.email}
              </div>
            )}
            {!errors.email && <div className="mt-2 h-5" data-oid="dgy74-u" />}
          </div>

          <div data-oid="e3_x-tu">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="5b1:bel"
            >
              Phone Number *
            </label>
            <div className="relative" data-oid="b_xg509">
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
                data-oid="-_bvtya"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="nib7uwe"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="x_i8ael"
                >
                  <path
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                    data-oid="m_wmd9h"
                  />
                </svg>
              </div>
              {getFieldStatus("phone", phone) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="9o:_a0_"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid=".wqpsg5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="q80ih-s"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="z8_us7-"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="bv:jm75"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="jk2x1ry"
                  />
                </svg>
                {errors.phone}
              </div>
            )}
            {!errors.phone && <div className="mt-2 h-5" data-oid="w7eq7nd" />}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="bg-white min-h-screen" data-oid="6nrq2ij">
      {/* Page Header Section */}
      <div
        className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border-b border-blue-200 relative overflow-hidden"
        data-oid="w5t0c__"
      >
        {/* Subtle medical pattern background */}
        <div className="absolute inset-0 opacity-5" data-oid="6w12jna">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232563eb' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "40px 40px",
            }}
            data-oid="pp87bz0"
          ></div>
        </div>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
          data-oid="j13obdx"
        >
          <div className="text-center" data-oid="rom1zlq">
            {/* Medical badge/credential indicator */}
            <div className="flex justify-center mb-6" data-oid="7lsj8a7">
              <div
                className="bg-white rounded-full p-4 shadow-lg border-2 border-blue-100"
                data-oid="y1s9fnu"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                  data-oid="kijykqh"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="a0-2--:"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      data-oid="x4fn2:7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1
              className="text-5xl font-bold text-gray-900 mb-4 tracking-tight"
              data-oid="dc6x8d3"
            >
              Sleep Apnea Risk Assessment
            </h1>

            <div className="max-w-4xl mx-auto mb-8" data-oid="kej:nwp">
              <p
                className="text-xl text-gray-700 mb-4 leading-relaxed"
                data-oid="nxqwr.i"
              >
                Complete our clinically validated STOP-BANG questionnaire to
                assess your risk for obstructive sleep apnea. This
                evidence-based screening tool enables our dental professionals
                to provide you with personalized care recommendations.
              </p>

              <div
                className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-6"
                data-oid="x_2-ihr"
              >
                <div className="flex items-center space-x-2" data-oid="h7:.:7d">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    data-oid="st57guz"
                  ></div>
                  <span data-oid="wtg-3n7">Clinically Validated Tool</span>
                </div>
                <div className="flex items-center space-x-2" data-oid="f1du805">
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    data-oid="tjbwz4m"
                  ></div>
                  <span data-oid="1_uwvj8">5-10 Minutes to Complete</span>
                </div>
                <div className="flex items-center space-x-2" data-oid="4y_ybl_">
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    data-oid="fouscrz"
                  ></div>
                  <span data-oid="0ktarpw">Professional Review Included</span>
                </div>
              </div>
            </div>

            {/* Enhanced privacy and security section */}
            <div className="max-w-4xl mx-auto" data-oid="sjscvca">
              <div className="grid md:grid-cols-3 gap-4" data-oid=":fscee3">
                {/* Privacy Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                  data-oid="uqw2cm-"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="fv2higx"
                  >
                    <div
                      className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="aq4jex6"
                    >
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="as92748"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="81l8pnk"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="wpuu_5q"
                    >
                      HIPAA Protected
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="zy.:70x">
                      Your health information is encrypted and protected
                      according to federal privacy standards.
                    </p>
                  </div>
                </div>

                {/* Medical Validation Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
                  data-oid="n0jvvr7"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="cls82:z"
                  >
                    <div
                      className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="j916hlc"
                    >
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="41e4l5q"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="k981qwv"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="dmcvka2"
                    >
                      Clinically Validated
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="4dp0yav">
                      STOP-BANG is a scientifically proven screening tool used
                      by medical professionals worldwide.
                    </p>
                  </div>
                </div>

                {/* Professional Review Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300"
                  data-oid="pmpng6w"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="bbko1e0"
                  >
                    <div
                      className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="c3pkl:d"
                    >
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="z1r5mhz"
                      >
                        <path
                          d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                          data-oid="d.rcniv"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="8zn0uka"
                    >
                      Expert Analysis
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="rh9tl5h">
                      Licensed dental professionals will review your results and
                      provide personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional credentials footer */}
              <div
                className="mt-8 pt-6 border-t border-gray-200"
                data-oid="1rr02z."
              >
                <div
                  className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500"
                  data-oid="ranw-p_"
                >
                  <div
                    className="flex items-center space-x-1"
                    data-oid="evss1jd"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="rbtwbn."
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                        data-oid="3djo-pn"
                      />
                    </svg>
                    <span data-oid="up0k6:.">256-bit SSL Encryption</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="0c4o7uo"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="x4nu6bm"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="gyx5mhc"
                      />
                    </svg>
                    <span data-oid="teuf515">HIPAA Compliant Platform</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="eg19-gj"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="ow_gu39"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        data-oid="15578.g"
                      />
                    </svg>
                    <span data-oid="0sic2o2">Evidence-Based Medicine</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="1.r41mm"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="bta1qmg"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                        data-oid="rxoi8ya"
                      />
                    </svg>
                    <span data-oid="yl7w6ew">Licensed Professionals</span>
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
        data-oid="eefnh7e"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
          noValidate
          data-oid=":qr.dyq"
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-6 z-10 mb-8"
            data-oid="09l8j-2"
          >
            <div
              className="flex justify-between items-center mb-3"
              data-oid="x:lm2:9"
            >
              <div className="flex items-center space-x-3" data-oid="chqcfct">
                <div
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  data-oid="p7:zu.:"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="q_5-ql4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                      data-oid="f_8zsnd"
                    />
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold text-gray-900"
                  data-oid="1rkdm1m"
                >
                  Assessment Progress
                </span>
              </div>
              <span
                className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                data-oid="0c3rw2p"
              >
                Complete all sections
              </span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-3 mb-2"
              data-oid="323o847"
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 w-0"
                data-oid="uqftet7"
              ></div>
            </div>
            <p
              className="text-sm text-gray-600 flex items-center"
              data-oid="2e1fp87"
            >
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="n.e18t9"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                  data-oid="04:vy_y"
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
            data-oid="s7-h6wg"
          />

          <YesNoQuestion
            name="tired"
            title="T - Tired"
            description="Do you often feel tired, fatigued, or sleepy during the day?"
            data-oid="g:92hyd"
          />

          <YesNoQuestion
            name="observed"
            title="O - Observed"
            description="Has anyone observed you stop breathing or gasping during sleep?"
            data-oid="ox5z4ao"
          />

          <YesNoQuestion
            name="pressure"
            title="P - Pressure"
            description="Do you have or are you being treated for high blood pressure?"
            data-oid="str7ydt"
          />

          <BMISection data-oid="7ecm5r8" />

          <AgeInput data-oid="7owdfc3" />

          <NeckSizeInput data-oid="4-5wjaj" />

          <YesNoQuestion
            name="genderMale"
            title="G - Gender"
            description="Are you male?"
            data-oid="hxi.lge"
          />

          <ContactFields data-oid="hm-6xzr" />

          <div
            className="bg-gradient-to-br from-white to-blue-50 p-10 rounded-xl shadow-2xl border border-blue-100 relative overflow-hidden"
            data-oid="6x5y05q"
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" data-oid="1t4:33k">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "30px 30px",
                }}
                data-oid="dcgrrwo"
              ></div>
            </div>

            <div className="relative z-10" data-oid=":wrlou9">
              <div className="text-center mb-8" data-oid="i_qni5h">
                {/* Medical icon with professional styling */}
                <div
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  data-oid="0521za-"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="7dws.0z"
                  >
                    <path
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      data-oid="r6tvf7x"
                    />
                  </svg>
                </div>

                <h3
                  className="text-3xl font-bold text-gray-900 mb-3 tracking-tight"
                  data-oid="hht400:"
                >
                  Ready to Submit Your Assessment
                </h3>
                <p
                  className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
                  data-oid="ft:wvyo"
                >
                  Please review your responses carefully before submitting. Our
                  dental professionals will analyze your results and provide
                  personalized recommendations for your sleep health.
                </p>
              </div>

              {/* Professional info cards */}
              <div
                className="grid md:grid-cols-3 gap-4 mb-8"
                data-oid="7xysgf-"
              >
                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="yjn7u1f"
                >
                  <div
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="0ksnc6c"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="gg:c0.s"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="ttyifti"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="rtoo-s0"
                  >
                    HIPAA Compliant
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="s02tg8f">
                    Your data is protected
                  </p>
                </div>

                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="579fzls"
                >
                  <div
                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="s3o3:q8"
                  >
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="28wqy-j"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="e5frcb3"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid=".7-nq28"
                  >
                    Clinically Validated
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="b.rsirq">
                    Evidence-based screening
                  </p>
                </div>

                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="jhcwzvh"
                >
                  <div
                    className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="fvgp8y-"
                  >
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="jvcgt7j"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                        data-oid="sqkej9z"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="235m-wr"
                  >
                    Expert Review
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="5bzv-j4">
                    Reviewed by specialists
                  </p>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
                data-oid="g90gl.0"
              >
                <button
                  type="button"
                  onClick={restartSurvey}
                  className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center font-medium shadow-sm hover:shadow-md"
                  data-oid="nw-qpt3"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="4012awl"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                      data-oid="-7kzlfx"
                    />
                  </svg>
                  Start Over
                </button>

                <button
                  type="submit"
                  className="px-10 py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 text-lg transform hover:scale-105 focus:ring-4 focus:ring-blue-200"
                  data-oid="qxtvsgx"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="82n:i4i"
                  >
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      data-oid="rzjsfs:"
                    />
                  </svg>
                  <span data-oid="z6xfsny">Submit Assessment</span>
                </button>
              </div>

              {/* Professional footer with credentials */}
              <div className="pt-6 border-t border-blue-200" data-oid="ubr2vnv">
                <div className="text-center space-y-3" data-oid="rk-01.o">
                  <div
                    className="flex items-center justify-center space-x-2 text-sm text-gray-700"
                    data-oid="q9q4hd:"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="d4vvr6k"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="9m6f1:2"
                      />
                    </svg>
                    <span className="font-medium" data-oid="9ojmcrl">
                      Secure Medical Assessment Platform
                    </span>
                  </div>

                  <p
                    className="text-xs text-gray-600 max-w-lg mx-auto"
                    data-oid="i5a_0uv"
                  >
                    This assessment will be reviewed by licensed dental
                    professionals. Results and recommendations will be provided
                    within 24-48 hours via secure communication.
                  </p>

                  <div
                    className="flex items-center justify-center space-x-4 text-xs text-gray-500"
                    data-oid="cz9co5:"
                  >
                    <span className="flex items-center" data-oid="rvvl922">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="1z_2_c-"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                          data-oid="_zq2-:k"
                        />
                      </svg>
                      SSL Encrypted
                    </span>
                    <span className="flex items-center" data-oid="g4br0u1">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="q34m41j"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="i5j.8ru"
                        />
                      </svg>
                      HIPAA Compliant
                    </span>
                    <span className="flex items-center" data-oid="-l:5oz1">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="0odajl3"
                      >
                        <path
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          data-oid="5xa5i4g"
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
