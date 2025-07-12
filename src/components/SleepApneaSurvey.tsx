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
      data-oid="1p5_isz"
    >
      {/* Header Section */}
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 mb-8"
        data-oid="tvhbtin"
      >
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-6 text-white"
          data-oid="c_yd7gu"
        >
          <div className="flex items-center justify-between" data-oid="inag05a">
            <div className="flex items-center space-x-4" data-oid="j8b816n">
              <div
                className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                data-oid="mu4uwid"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="n1_gyiy"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    data-oid="-seithj"
                  />
                </svg>
              </div>
              <div data-oid="9f5ukm1">
                <h1 className="text-2xl font-bold" data-oid="7tzp5ne">
                  STOP-BANG Assessment Results
                </h1>
                <p className="text-blue-100" data-oid="q8emgl5">
                  Clinical Sleep Apnea Risk Evaluation
                </p>
              </div>
            </div>
            <div className="text-right" data-oid="e4c9b.-">
              <div className="text-sm text-blue-100" data-oid="l_9g248">
                Patient:
              </div>
              <div className="font-semibold" data-oid="s:49wmv">
                {results.name}
              </div>
            </div>
          </div>
        </div>

        {/* Score and Risk Level Section */}
        <div className="p-8" data-oid="1onaf4:">
          <div className="grid md:grid-cols-2 gap-8 mb-8" data-oid="aplohra">
            {/* Score Display */}
            <div className="text-center" data-oid="28eqn__">
              <div className="mb-4" data-oid="j4yvq4z">
                <h2
                  className="text-xl font-semibold text-slate-800 mb-2"
                  data-oid="y0x6ot_"
                >
                  Assessment Score
                </h2>
                <div className="relative inline-block" data-oid="6_9v7:w">
                  <div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
                    data-oid="vn-4szn"
                  >
                    <div className="text-center" data-oid="6h8s.h8">
                      <div
                        className="text-4xl font-bold text-white"
                        data-oid=":z5_i-k"
                      >
                        {results.score}
                      </div>
                      <div className="text-sm text-blue-100" data-oid="w8y:heg">
                        out of 8
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                    data-oid=":zx7_yf"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="22l4psp"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                        data-oid="_dqz6z2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Display */}
            <div className="flex flex-col justify-center" data-oid="7b8.nsh">
              <h2
                className="text-xl font-semibold text-slate-800 mb-4"
                data-oid="zfx1_e1"
              >
                Risk Assessment
              </h2>
              <div className="space-y-4" data-oid="76qv8c5">
                <div
                  className={classNames(
                    "p-4 rounded-lg border-l-4 font-semibold text-lg",
                    results.riskLevel === "Low Risk"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : results.riskLevel === "Intermediate Risk"
                        ? "bg-amber-50 border-amber-500 text-amber-800"
                        : "bg-red-50 border-red-500 text-red-800",
                  )}
                  data-oid="qpczis6"
                >
                  <div
                    className="flex items-center space-x-2"
                    data-oid="-bo5rsf"
                  >
                    <div
                      className={classNames(
                        "w-3 h-3 rounded-full",
                        results.riskLevel === "Low Risk"
                          ? "bg-emerald-500"
                          : results.riskLevel === "Intermediate Risk"
                            ? "bg-amber-500"
                            : "bg-red-500",
                      )}
                      data-oid="fujweyr"
                    ></div>
                    <span data-oid="07dzqbm">{results.riskLevel}</span>
                  </div>
                  <p className="text-sm mt-2 opacity-80" data-oid="w5ulnki">
                    for Obstructive Sleep Apnea
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Interpretation */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8" data-oid="g0c-s.3">
            <h3
              className="text-lg font-semibold text-slate-800 mb-4 flex items-center"
              data-oid="co21_7e"
            >
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid=".p17_6k"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  data-oid="8az82wx"
                />
              </svg>
              Clinical Interpretation
            </h3>
            <div className="prose prose-slate max-w-none" data-oid="tlu:hze">
              {results.riskLevel === "Low Risk" && (
                <p
                  className="text-slate-700 leading-relaxed"
                  data-oid="khgmogi"
                >
                  Your STOP-BANG score indicates a{" "}
                  <strong data-oid="sizixu1">lower probability</strong> of
                  moderate to severe obstructive sleep apnea. However, if you
                  continue to experience sleep-related symptoms such as
                  excessive daytime sleepiness, witnessed breathing
                  interruptions, or morning headaches, we recommend discussing
                  these concerns with your healthcare provider.
                </p>
              )}
              {results.riskLevel === "Intermediate Risk" && (
                <p
                  className="text-slate-700 leading-relaxed"
                  data-oid="qcxzpjl"
                >
                  Your STOP-BANG score suggests an{" "}
                  <strong data-oid="o8_s4t7">intermediate probability</strong>{" "}
                  of moderate to severe obstructive sleep apnea. We recommend
                  scheduling a consultation with your healthcare provider to
                  discuss these results and determine if further evaluation,
                  such as a sleep study, would be beneficial for your health.
                </p>
              )}
              {results.riskLevel === "High Risk" && (
                <p
                  className="text-slate-700 leading-relaxed"
                  data-oid="5d:epzz"
                >
                  Your STOP-BANG score indicates a{" "}
                  <strong data-oid=":g8kna4">high probability</strong> of
                  moderate to severe obstructive sleep apnea. We strongly
                  recommend prompt consultation with your healthcare provider
                  for comprehensive evaluation. A sleep study may be recommended
                  to confirm the diagnosis and determine the most appropriate
                  treatment approach.
                </p>
              )}
            </div>
          </div>

          {/* Medical Information Section */}
          <div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8"
            data-oid="060fgtt"
          >
            <div className="flex items-start space-x-4" data-oid="hpf40e_">
              <div
                className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                data-oid="xelur86"
              >
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="0a8vkep"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    data-oid="4l06rq1"
                  />
                </svg>
              </div>
              <div className="flex-1" data-oid="tqrhpvw">
                <h3
                  className="font-semibold text-blue-900 mb-3"
                  data-oid="_umqn8j"
                >
                  Understanding Sleep Apnea
                </h3>
                <p
                  className="text-slate-700 mb-3 leading-relaxed"
                  data-oid=":wybhrb"
                >
                  Sleep apnea is more than just snoring—it's a serious medical
                  condition that can significantly impact your overall health,
                  affecting memory, energy levels, cardiovascular health, and
                  metabolic function.
                </p>
                <p
                  className="text-slate-700 leading-relaxed"
                  data-oid="x44l7hz"
                >
                  At our practice, we take a comprehensive approach to patient
                  care, recognizing that
                  <strong className="text-blue-800" data-oid="b3tp6gk">
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
            className="bg-white border border-slate-200 rounded-lg p-6 mb-8"
            data-oid="o266kw3"
          >
            <h3
              className="text-lg font-semibold text-slate-800 mb-4 flex items-center"
              data-oid="la3k9lr"
            >
              <svg
                className="w-5 h-5 mr-2 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="_.-c3p0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  data-oid="0.9tnmm"
                />
              </svg>
              Additional Clinical Considerations
            </h3>
            <p
              className="text-slate-600 text-sm mb-4 italic"
              data-oid="vmrtjtd"
            >
              Please indicate any additional factors that may be relevant to
              your sleep health assessment:
            </p>

            <div className="space-y-4" data-oid="g8yj839">
              {/* General Risk Factors */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                data-oid="ig-acec"
              >
                {[
                  "Depression or mood disorders",
                  "Anxiety disorders",
                  "Chronic pain conditions",
                  "Memory or concentration difficulties",
                  "ADHD/ADD diagnosis",
                  "Family history of sleep apnea",
                  "Chronic dry mouth",
                  "Frequent morning headaches",
                  "High caffeine dependency (>2 cups/day)",
                  "Regular sleep medication use",
                  "Difficulty with weight management",
                ].map((factor, index) => (
                  <label
                    key={index}
                    className="flex items-start space-x-3 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    data-oid=":2in-e-"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                      data-oid="40wzhx7"
                    />

                    <span
                      className="text-slate-700 text-sm leading-relaxed"
                      data-oid="hjyqd0e"
                    >
                      {factor}
                    </span>
                  </label>
                ))}
              </div>

              {/* Female-Specific Section */}
              <div
                className="mt-6 pt-6 border-t border-slate-200"
                data-oid="kcsc6on"
              >
                <h4
                  className="font-semibold text-slate-800 mb-4 flex items-center"
                  data-oid="-6n74hs"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="f70vhix"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      data-oid="a.s5:kx"
                    />
                  </svg>
                  Female-Specific Risk Factors:
                </h4>
                <div className="space-y-3" data-oid="37kh:27">
                  {[
                    "Polycystic Ovarian Syndrome (PCOS)",
                    "Post-menopausal status",
                  ].map((factor, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-3 cursor-pointer hover:bg-pink-50 p-3 rounded-lg transition-colors border border-transparent hover:border-pink-200"
                      data-oid="g1qcb7e"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-pink-600 bg-white border-slate-300 rounded focus:ring-pink-500 focus:ring-2 mt-0.5"
                        data-oid="gw6:xif"
                      />

                      <span
                        className="text-slate-700 text-sm leading-relaxed"
                        data-oid="h-c3:e5"
                      >
                        {factor}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div
              className="mt-6 pt-4 border-t border-slate-200"
              data-oid="pz2u-hq"
            >
              <div className="flex items-start space-x-2" data-oid="1h-uoo:">
                <svg
                  className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="i9yo_0_"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    data-oid="yemm8c6"
                  />
                </svg>
                <p
                  className="text-xs text-slate-500 leading-relaxed"
                  data-oid="1kz0n64"
                >
                  <strong data-oid="7f1hwco">Privacy Notice:</strong> Your
                  responses will be shared confidentially with our clinical team
                  to provide personalized care recommendations and ensure
                  comprehensive treatment planning.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
            data-oid="05p2c-4"
          >
            <h3
              className="text-lg font-semibold text-blue-900 mb-4 flex items-center"
              data-oid="r97vn0v"
            >
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid=".cclv.0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  data-oid="jwmd0.i"
                />
              </svg>
              Recommended Next Steps
            </h3>
            <div className="space-y-3" data-oid="-9mnh_n">
              <div className="flex items-start space-x-3" data-oid="m_bm-at">
                <div
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
                  data-oid="o8hf6bq"
                >
                  1
                </div>
                <p className="text-blue-800 leading-relaxed" data-oid="2lpaxnp">
                  A licensed healthcare professional from our team will contact
                  you within 24-48 hours to discuss your results.
                </p>
              </div>
              <div className="flex items-start space-x-3" data-oid="ga93ohb">
                <div
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
                  data-oid="g81i:tw"
                >
                  2
                </div>
                <p className="text-blue-800 leading-relaxed" data-oid="zi_fip5">
                  We will review your medical history and current symptoms to
                  develop a personalized care plan.
                </p>
              </div>
              <div className="flex items-start space-x-3" data-oid="yc0btlk">
                <div
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
                  data-oid="2ki1ifl"
                >
                  3
                </div>
                <p className="text-blue-800 leading-relaxed" data-oid="n6qtx42">
                  If indicated, we will coordinate appropriate referrals and
                  treatment options tailored to your needs.
                </p>
              </div>
            </div>
          </div>

          {/* Email Results Option */}
          <div className="mb-8" data-oid="ucim45-">
            <label
              className="flex items-center justify-center space-x-3 cursor-pointer bg-slate-50 hover:bg-slate-100 p-4 rounded-lg border border-slate-200 transition-all duration-200 hover:shadow-md"
              data-oid="e4c9a-a"
            >
              <input
                type="checkbox"
                checked={emailResults}
                onChange={(e) => setEmailResults(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                data-oid="zbte690"
              />

              <div className="flex items-center space-x-3" data-oid="a_j1y4t">
                <div
                  className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                  data-oid=":61y3b0"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid=":ekl1qb"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      data-oid="9o00ul7"
                    />
                  </svg>
                </div>
                <span className="text-slate-700 font-medium" data-oid="lyaphmz">
                  Email me a secure copy of my assessment results
                </span>
              </div>
            </label>
            {emailResults && (
              <div
                className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                data-oid="v5nntus"
              >
                <p
                  className="text-sm text-blue-700 text-center"
                  data-oid="u.:ry51"
                >
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="2i-puk9"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                      data-oid="fy-m17d"
                    />
                  </svg>
                  Results will be sent securely to your registered email address
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            data-oid="ix0bulx"
          >
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg font-medium"
              data-oid="lhy4jij"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="qwh_zc8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  data-oid="4oa-hb4"
                />
              </svg>
              Print Assessment Report
            </button>

            <button
              onClick={restartSurvey}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg font-medium"
              data-oid="4h5-um1"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="-u-zdnq"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  data-oid="qr0papy"
                />
              </svg>
              Take New Assessment
            </button>
          </div>

          {/* Professional Disclaimer */}
          <div className="border-t border-slate-200 pt-6" data-oid="gi8aixq">
            <div
              className="bg-amber-50 border border-amber-200 rounded-lg p-4"
              data-oid="qh9gq1i"
            >
              <div className="flex items-start space-x-3" data-oid="qqp2ekv">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="koovcms"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    data-oid=":e-qbgw"
                  />
                </svg>
                <div data-oid="hs03k41">
                  <h4
                    className="font-semibold text-amber-800 mb-1"
                    data-oid="w5c_n1q"
                  >
                    Medical Disclaimer
                  </h4>
                  <p
                    className="text-sm text-amber-700 leading-relaxed"
                    data-oid="sf7nbde"
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
    return <ResultsDisplay results={surveyResults} data-oid="8-g.3io" />;
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
        data-oid=":-op0q7"
      >
        <div
          className="flex items-start justify-between mb-2"
          data-oid="e58ttdx"
        >
          <h3
            className="text-lg font-semibold text-gray-900"
            data-oid="_fa.2v4"
          >
            {title}
          </h3>
          {isAnswered && (
            <div
              className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full"
              data-oid="xhb_ww6"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="qkqmv6:"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                  data-oid="vewjevn"
                />
              </svg>
              Answered
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4" data-oid="vdji5h6">
          {description}
        </p>

        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value) => value !== null || "This question is required",
          }}
          render={({ field }) => (
            <div className="flex space-x-4" data-oid="lj8mb.z">
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
                data-oid="u3w76yh"
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
                  data-oid="t9jj70r"
                />

                <div
                  className={classNames(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    {
                      "border-green-500 bg-green-500": field.value === true,
                      "border-gray-400": field.value !== true,
                    },
                  )}
                  data-oid="t.s4kuq"
                >
                  {field.value === true && (
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-pulse"
                      data-oid="b1pv4kg"
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
                  data-oid="1-m8r1z"
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
                data-oid="lwtfzrm"
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
                  data-oid="2iy0zm:"
                />

                <div
                  className={classNames(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    {
                      "border-red-500 bg-red-500": field.value === false,
                      "border-gray-400": field.value !== false,
                    },
                  )}
                  data-oid="3f5p8et"
                >
                  {field.value === false && (
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-pulse"
                      data-oid="k2huno9"
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
                  data-oid="3ji9u:o"
                >
                  No
                </span>
              </label>
            </div>
          )}
          data-oid="rci8fd."
        />

        {errors[name] && (
          <div
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"
            data-oid="tfuhzr3"
          >
            <p
              className="text-sm text-red-600 flex items-center"
              data-oid="r.ung:z"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="jjo3z5t"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                  data-oid="-rp6.6l"
                />
              </svg>
              {errors[name]?.message}
            </p>
          </div>
        )}
        {!errors[name] && <div className="mt-3 h-0" data-oid="ugeer86" />}
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
        data-oid="u48pe_r"
      >
        <h3
          className="text-lg font-semibold text-gray-900 mb-2"
          data-oid="3s2mo3h"
        >
          BMI Calculator
        </h3>
        <p className="text-gray-600 mb-4" data-oid="jny:70v">
          Calculate your BMI to determine if it's over 35.
        </p>

        <div className="mb-4" data-oid="14o.txh">
          <p
            className="text-sm font-medium text-gray-700 mb-2"
            data-oid="d-nob_l"
          >
            Select units:
          </p>
          <div className="flex space-x-4" data-oid="9ooqb1e">
            <label
              className="flex items-center space-x-2 cursor-pointer"
              data-oid="e4cmga."
            >
              <input
                type="radio"
                checked={units === "metric"}
                onChange={() => setUnits("metric")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                data-oid="n-x.tf8"
              />

              <span className="text-gray-900" data-oid="ovhd8_8">
                cm / kg
              </span>
            </label>
            <label
              className="flex items-center space-x-2 cursor-pointer"
              data-oid="c..tk.o"
            >
              <input
                type="radio"
                checked={units === "imperial"}
                onChange={() => setUnits("imperial")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                data-oid="zic87se"
              />

              <span className="text-gray-900" data-oid="f-06:yd">
                in / lb
              </span>
            </label>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          data-oid="3g3xhue"
        >
          <div data-oid="xfra63m">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              data-oid=".tq570o"
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
              data-oid="vqzdd5w"
            />
          </div>

          <div data-oid="v6smwvm">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              data-oid="u2svwui"
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
              data-oid="4d5tyc:"
            />
          </div>
        </div>

        <div className="mb-4" data-oid="l3cm86e">
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
            data-oid="byp0b0r"
          >
            Calculate BMI
          </button>
          {showBMI && (
            <button
              type="button"
              onClick={resetCalculator}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              data-oid="xvj675r"
            >
              Reset
            </button>
          )}
        </div>

        {showBMI && localBMI && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4" data-oid="so-40zc">
            <p className="text-sm font-medium text-blue-900" data-oid=".bjqz0f">
              Your BMI:{" "}
              <span className="text-lg font-bold" data-oid="2aw7fyg">
                {localBMI}
              </span>
            </p>
            <p className="text-sm text-blue-700 mt-1" data-oid="uqg7x8l">
              BMI over 35:{" "}
              <span className="font-semibold" data-oid="29na:s5">
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
            data-oid="cvq8g-z"
          />

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6"
            data-oid="fr_zd2q"
          >
            <h3
              className="text-lg font-semibold text-gray-900 mb-2"
              data-oid="rgd85nr"
            >
              BMI &gt; 35
            </h3>
            <p className="text-gray-600 mb-4" data-oid="9__pqkl">
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
                <div className="flex space-x-4" data-oid="h._fwf5">
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
                    data-oid="rq_id.q"
                  >
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => !isDisabled && field.onChange(true)}
                      disabled={isDisabled}
                      className="sr-only"
                      data-oid="plzz2tw"
                    />

                    <div
                      className={classNames(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        {
                          "border-green-500 bg-green-500": field.value === true,
                          "border-gray-300": field.value !== true,
                        },
                      )}
                      data-oid="zm98hmp"
                    >
                      {field.value === true && (
                        <div
                          className="w-2 h-2 bg-white rounded-full"
                          data-oid="7sh5f7_"
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-gray-900"
                      data-oid="njv7.cv"
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
                    data-oid="h.52inv"
                  >
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => !isDisabled && field.onChange(false)}
                      disabled={isDisabled}
                      className="sr-only"
                      data-oid="mxbrv5q"
                    />

                    <div
                      className={classNames(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        {
                          "border-red-500 bg-red-500": field.value === false,
                          "border-gray-300": field.value !== false,
                        },
                      )}
                      data-oid=".s:_cbo"
                    >
                      {field.value === false && (
                        <div
                          className="w-2 h-2 bg-white rounded-full"
                          data-oid="y0.lwi2"
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-gray-900"
                      data-oid="8pv52:-"
                    >
                      No
                    </span>
                  </label>
                </div>
              )}
              data-oid="m0doalq"
            />

            {errors.bmiOver35 && (
              <div className="mt-2 h-6" data-oid="r0e-l0k">
                <p className="text-sm text-red-600" data-oid="i3cistg">
                  {errors.bmiOver35?.message}
                </p>
              </div>
            )}
            {!errors.bmiOver35 && (
              <div className="mt-2 h-6" data-oid="76ctcmv" />
            )}

            {bmiCalculated && (
              <p className="text-xs text-gray-500 mt-2" data-oid="rzn-0xd">
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
      data-oid="j:61ejp"
    />
  ));

  const AgeInput: React.FC = React.memo(() => (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      data-oid="mtw47ks"
    >
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-oid="7qvk2qw"
      >
        Age
      </h3>
      <p className="text-gray-600 mb-4" data-oid="5j-k:a2">
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
            data-oid="8xk--00"
          />
        )}
        data-oid="zs5w:-_"
      />

      {errors.age && (
        <p className="mb-4 text-sm text-red-600" data-oid="x8gihwo">
          {errors.age.message}
        </p>
      )}

      <YesNoQuestion
        name="ageOver50"
        title="Age > 50"
        description="Are you over 50 years old?"
        disabled={true}
        data-oid="x:nvsfl"
      />
    </div>
  ));

  const NeckSizeInput: React.FC = React.memo(() => (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      data-oid="vitx75l"
    >
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-oid="3ivn40c"
      >
        Neck Size
      </h3>
      <p className="text-gray-600 mb-4" data-oid="cd0oq2c">
        Please measure your neck circumference.
      </p>

      <div className="flex space-x-2 mb-4" data-oid="bfj3w4t">
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
              data-oid="kre6cjs"
            />
          )}
          data-oid="h0ftmpt"
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
              data-oid="2in26qk"
            >
              <option value="inches" data-oid="zgfdtj1">
                inches
              </option>
              <option value="cm" data-oid="b5exjuv">
                cm
              </option>
            </select>
          )}
          data-oid="dsqpcxl"
        />
      </div>
      {errors.neckSize && (
        <p className="mb-4 text-sm text-red-600" data-oid=":38zpz2">
          {errors.neckSize.message}
        </p>
      )}

      <YesNoQuestion
        name="neckSizeOver16"
        title="Neck Size > 16 inches"
        description="Is your neck circumference greater than 16 inches (40cm)?"
        disabled={true}
        data-oid="hhysi02"
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
        data-oid="f28uzu5"
      >
        <div className="flex items-center mb-4" data-oid="4y-jo:0">
          <div
            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
            data-oid="xrk1dim"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              data-oid="1tdfxw7"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
                data-oid="33z22ws"
              />
            </svg>
          </div>
          <div data-oid="lj69:dr">
            <h3
              className="text-lg font-semibold text-gray-900"
              data-oid="u-0zphv"
            >
              Contact Information
            </h3>
            <p className="text-gray-600 text-sm" data-oid="6mbyu::">
              Your details are kept confidential and secure
            </p>
          </div>
        </div>

        <div className="space-y-6" data-oid="mlo_opy">
          <div data-oid="jhq0ubc">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="ns8sgpr"
            >
              Full Name *
            </label>
            <div className="relative" data-oid="rofni6j">
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
                data-oid="ebh6buk"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="juv61_r"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="52l4hls"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                    data-oid="2msivmm"
                  />
                </svg>
              </div>
              {getFieldStatus("fullName", fullName) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="i-09-2k"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="6:sqz4:"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="um4_0bg"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.fullName && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="6zt21jv"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="whx21hg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="fq3jzep"
                  />
                </svg>
                {errors.fullName}
              </div>
            )}
            {!errors.fullName && (
              <div className="mt-2 h-5" data-oid="8k3ptth" />
            )}
          </div>

          <div data-oid="8rw1_5l">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="2y5n083"
            >
              Email Address *
            </label>
            <div className="relative" data-oid="87b6f0y">
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
                data-oid="fuzuago"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="-6la0g0"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="ru1qsvu"
                >
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    data-oid="g4a5m03"
                  />

                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    data-oid="1zig7ah"
                  />
                </svg>
              </div>
              {getFieldStatus("email", email) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid=":8-e:1h"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="rx81vem"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="hlr:rbr"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="j6b6b09"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="wx.nlg:"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="f699pwy"
                  />
                </svg>
                {errors.email}
              </div>
            )}
            {!errors.email && <div className="mt-2 h-5" data-oid="4wb9vqi" />}
          </div>

          <div data-oid="jxlxrb:">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              data-oid="1.gq5c6"
            >
              Phone Number *
            </label>
            <div className="relative" data-oid="i7a3do.">
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
                data-oid="22qoflo"
              />

              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                data-oid="0250t-6"
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="oakju:i"
                >
                  <path
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                    data-oid="3_3fru8"
                  />
                </svg>
              </div>
              {getFieldStatus("phone", phone) === "success" && (
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-oid="17ine4b"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="g3eqgak"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      data-oid="s.0js0:"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && (
              <div
                className="mt-2 flex items-center text-sm text-red-600"
                data-oid="wzb.gq-"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-oid="5dj6l3_"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                    data-oid="v0bf__h"
                  />
                </svg>
                {errors.phone}
              </div>
            )}
            {!errors.phone && <div className="mt-2 h-5" data-oid="wlek791" />}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="bg-white min-h-screen" data-oid="7jadcli">
      {/* Page Header Section */}
      <div
        className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border-b border-blue-200 relative overflow-hidden"
        data-oid="-jil:xm"
      >
        {/* Subtle medical pattern background */}
        <div className="absolute inset-0 opacity-5" data-oid="_cw.6qu">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232563eb' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "40px 40px",
            }}
            data-oid="gh0oht9"
          ></div>
        </div>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
          data-oid="ipd.bix"
        >
          <div className="text-center" data-oid="wpf5c92">
            {/* Medical badge/credential indicator */}
            <div className="flex justify-center mb-6" data-oid="n.dowa9">
              <div
                className="bg-white rounded-full p-4 shadow-lg border-2 border-blue-100"
                data-oid="q_mrwrr"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                  data-oid="q2zdfuu"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="idxv9a7"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      data-oid=".g8c:kz"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1
              className="text-5xl font-bold text-gray-900 mb-4 tracking-tight"
              data-oid="q6hriub"
            >
              Sleep Apnea Risk Assessment
            </h1>

            <div className="max-w-4xl mx-auto mb-8" data-oid="slb-sxa">
              <p
                className="text-xl text-gray-700 mb-4 leading-relaxed"
                data-oid="1ij6n9w"
              >
                Complete our clinically validated STOP-BANG questionnaire to
                assess your risk for obstructive sleep apnea. This
                evidence-based screening tool enables our dental professionals
                to provide you with personalized care recommendations.
              </p>

              <div
                className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-6"
                data-oid="5h7n026"
              >
                <div className="flex items-center space-x-2" data-oid="lg0bsqp">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    data-oid="0hx2ch6"
                  ></div>
                  <span data-oid="z16gg9c">Clinically Validated Tool</span>
                </div>
                <div className="flex items-center space-x-2" data-oid="xbq8elu">
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    data-oid="hal.va4"
                  ></div>
                  <span data-oid="z10lizr">5-10 Minutes to Complete</span>
                </div>
                <div className="flex items-center space-x-2" data-oid="hzrfozq">
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    data-oid="43y4l8m"
                  ></div>
                  <span data-oid="9t87lzx">Professional Review Included</span>
                </div>
              </div>
            </div>

            {/* Enhanced privacy and security section */}
            <div className="max-w-4xl mx-auto" data-oid="atatm-i">
              <div className="grid md:grid-cols-3 gap-4" data-oid="v1f2-im">
                {/* Privacy Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                  data-oid="lzkkku:"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="3n2:zjx"
                  >
                    <div
                      className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="zntfcvs"
                    >
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="6.23gbx"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="9d3-7c."
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid=":8ulxhk"
                    >
                      HIPAA Protected
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="kyj84c0">
                      Your health information is encrypted and protected
                      according to federal privacy standards.
                    </p>
                  </div>
                </div>

                {/* Medical Validation Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
                  data-oid="m2pla6c"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="x4mjm.w"
                  >
                    <div
                      className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="bw1ayjt"
                    >
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="0ezg-qo"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="inayg51"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="-q7096e"
                    >
                      Clinically Validated
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="6gz33n9">
                      STOP-BANG is a scientifically proven screening tool used
                      by medical professionals worldwide.
                    </p>
                  </div>
                </div>

                {/* Professional Review Card */}
                <div
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300"
                  data-oid="bzf0:1_"
                >
                  <div
                    className="flex flex-col items-center text-center"
                    data-oid="odsun.h"
                  >
                    <div
                      className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4"
                      data-oid="5qpgu05"
                    >
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="pz:b_m:"
                      >
                        <path
                          d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                          data-oid="k1o_1wy"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2"
                      data-oid="co9umuj"
                    >
                      Expert Analysis
                    </h3>
                    <p className="text-sm text-gray-600" data-oid="ak8v82i">
                      Licensed dental professionals will review your results and
                      provide personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional credentials footer */}
              <div
                className="mt-8 pt-6 border-t border-gray-200"
                data-oid="hpeg4r6"
              >
                <div
                  className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500"
                  data-oid="u899n_."
                >
                  <div
                    className="flex items-center space-x-1"
                    data-oid="3z_b6rn"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="m0g4c3p"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                        data-oid="_a7bt8."
                      />
                    </svg>
                    <span data-oid="t.ezhux">256-bit SSL Encryption</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="ctjt1.x"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="ylj2m.z"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="c:mpn-v"
                      />
                    </svg>
                    <span data-oid="2shg3pb">HIPAA Compliant Platform</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="yt68r8_"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="cyop9fn"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        data-oid="q6fl_sq"
                      />
                    </svg>
                    <span data-oid=".yuaxib">Evidence-Based Medicine</span>
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    data-oid="7.meqsz"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="0mdui91"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                        data-oid="tzf0r19"
                      />
                    </svg>
                    <span data-oid="w8.:hf2">Licensed Professionals</span>
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
        data-oid=":.u7u0r"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
          noValidate
          data-oid="40m8ymh"
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-6 z-10 mb-8"
            data-oid="ubfn-ur"
          >
            <div
              className="flex justify-between items-center mb-3"
              data-oid="7u6qo26"
            >
              <div className="flex items-center space-x-3" data-oid="p8f_wgp">
                <div
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  data-oid="htloopn"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="s:6k4-o"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                      data-oid="n2w:e-9"
                    />
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold text-gray-900"
                  data-oid="7bm1:4d"
                >
                  Assessment Progress
                </span>
              </div>
              <span
                className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                data-oid="8_w-7_n"
              >
                Complete all sections
              </span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-3 mb-2"
              data-oid="y9djmfq"
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 w-0"
                data-oid="4xwvge0"
              ></div>
            </div>
            <p
              className="text-sm text-gray-600 flex items-center"
              data-oid="jp-sroh"
            >
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="w:07tnl"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                  data-oid="a1n_veg"
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
            data-oid="ykdy5i6"
          />

          <YesNoQuestion
            name="tired"
            title="T - Tired"
            description="Do you often feel tired, fatigued, or sleepy during the day?"
            data-oid="53o42:1"
          />

          <YesNoQuestion
            name="observed"
            title="O - Observed"
            description="Has anyone observed you stop breathing or gasping during sleep?"
            data-oid="uurdn1j"
          />

          <YesNoQuestion
            name="pressure"
            title="P - Pressure"
            description="Do you have or are you being treated for high blood pressure?"
            data-oid="-xzxj7i"
          />

          <BMISection data-oid="5zlws3t" />

          <AgeInput data-oid="vdxh740" />

          <NeckSizeInput data-oid="klli.bl" />

          <YesNoQuestion
            name="genderMale"
            title="G - Gender"
            description="Are you male?"
            data-oid="tz2a25x"
          />

          <ContactFields data-oid=":scp282" />

          <div
            className="bg-gradient-to-br from-white to-blue-50 p-10 rounded-xl shadow-2xl border border-blue-100 relative overflow-hidden"
            data-oid="80x24.9"
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" data-oid="0cf73sc">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "30px 30px",
                }}
                data-oid="-oxxdt8"
              ></div>
            </div>

            <div className="relative z-10" data-oid="xq-dm6z">
              <div className="text-center mb-8" data-oid="04oky4h">
                {/* Medical icon with professional styling */}
                <div
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  data-oid="l2jeqgm"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="g5ee1xy"
                  >
                    <path
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      data-oid="a0:.jjr"
                    />
                  </svg>
                </div>

                <h3
                  className="text-3xl font-bold text-gray-900 mb-3 tracking-tight"
                  data-oid="y8s03v8"
                >
                  Ready to Submit Your Assessment
                </h3>
                <p
                  className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
                  data-oid="n3v:9de"
                >
                  Please review your responses carefully before submitting. Our
                  dental professionals will analyze your results and provide
                  personalized recommendations for your sleep health.
                </p>
              </div>

              {/* Professional info cards */}
              <div
                className="grid md:grid-cols-3 gap-4 mb-8"
                data-oid="azxtsog"
              >
                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="58pi-fw"
                >
                  <div
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="tbzyitr"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="8vk4ytf"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="ea-tiks"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="unnkpmd"
                  >
                    HIPAA Compliant
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="j_9lab8">
                    Your data is protected
                  </p>
                </div>

                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="94gnn24"
                >
                  <div
                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="q41-rzy"
                  >
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="k30rkc:"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="oy5dsnp"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="ig_sddo"
                  >
                    Clinically Validated
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="r7m05yw">
                    Evidence-based screening
                  </p>
                </div>

                <div
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 text-center"
                  data-oid="wz4h4eq"
                >
                  <div
                    className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"
                    data-oid="nrp__o."
                  >
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid="ou6tnb1"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                        data-oid="x21kgqo"
                      />
                    </svg>
                  </div>
                  <h4
                    className="font-semibold text-gray-900 text-sm mb-1"
                    data-oid="uxez11g"
                  >
                    Expert Review
                  </h4>
                  <p className="text-xs text-gray-600" data-oid="o5sxvin">
                    Reviewed by specialists
                  </p>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
                data-oid="yfe8eir"
              >
                <button
                  type="button"
                  onClick={restartSurvey}
                  className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center font-medium shadow-sm hover:shadow-md"
                  data-oid="y3eflor"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    data-oid="vp2nwm3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                      data-oid="gz4w8ef"
                    />
                  </svg>
                  Start Over
                </button>

                <button
                  type="submit"
                  className="px-10 py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 text-lg transform hover:scale-105 focus:ring-4 focus:ring-blue-200"
                  data-oid="51hkio7"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="bowbmr0"
                  >
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      data-oid="10oymat"
                    />
                  </svg>
                  <span data-oid="p8fx4y9">Submit Assessment</span>
                </button>
              </div>

              {/* Professional footer with credentials */}
              <div className="pt-6 border-t border-blue-200" data-oid="euy2946">
                <div className="text-center space-y-3" data-oid="xdppe38">
                  <div
                    className="flex items-center justify-center space-x-2 text-sm text-gray-700"
                    data-oid="dwtrdvd"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      data-oid=":5a8vlo"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                        data-oid="rhj0e1y"
                      />
                    </svg>
                    <span className="font-medium" data-oid="6uysrue">
                      Secure Medical Assessment Platform
                    </span>
                  </div>

                  <p
                    className="text-xs text-gray-600 max-w-lg mx-auto"
                    data-oid="fmzahof"
                  >
                    This assessment will be reviewed by licensed dental
                    professionals. Results and recommendations will be provided
                    within 24-48 hours via secure communication.
                  </p>

                  <div
                    className="flex items-center justify-center space-x-4 text-xs text-gray-500"
                    data-oid="em7awf."
                  >
                    <span className="flex items-center" data-oid="l:s4wzc">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="12gx-xr"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                          data-oid="9f8f2r0"
                        />
                      </svg>
                      SSL Encrypted
                    </span>
                    <span className="flex items-center" data-oid="hnik2g2">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="2tc_aku"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                          data-oid="f-hgyqc"
                        />
                      </svg>
                      HIPAA Compliant
                    </span>
                    <span className="flex items-center" data-oid="xij-:tk">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        data-oid="x_64.pv"
                      >
                        <path
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          data-oid="q47puig"
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
