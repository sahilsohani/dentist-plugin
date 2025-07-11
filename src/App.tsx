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
    <div className="min-h-screen bg-gray-50" data-oid="9rp48ft">
      <Header data-oid=":1w7u5y" />
      <Breadcrumb items={breadcrumbItems} data-oid="uw.smrj" />
      <main data-oid="lczz:vn">
        <SleepApneaSurvey data-oid="mg09:w9" />
      </main>
    </div>
  );
}

export default App;
