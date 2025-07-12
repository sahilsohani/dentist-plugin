import Header from "./components/Header";
import Breadcrumb from "./components/Breadcrumb";
import SleepApneaSurvey from "./components/SleepApneaSurvey";
import "./App.css";

function App() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Patients", href: "/patients" },
    { label: "Sleep Apnea Survey", current: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-oid=":ixzk8a">
      <Header data-oid="8a0_10_" />
      <Breadcrumb items={breadcrumbItems} data-oid=":0m_-t6" />
      <main data-oid="j-ki_25">
        <SleepApneaSurvey data-oid="unyjx0y" />
      </main>
    </div>
  );
}

export default App;
