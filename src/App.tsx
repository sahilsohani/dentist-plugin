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
    <div className="min-h-screen bg-gray-50" data-oid="o4df_5:">
      <Header data-oid="ly4l.27" />
      <Breadcrumb items={breadcrumbItems} data-oid="mx065a-" />
      <main data-oid="421za7-">
        <SleepApneaSurvey data-oid="y0sun96" />
      </main>
    </div>
  );
}

export default App;
