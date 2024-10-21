import { useTranslation } from "react-i18next";
import { Demo } from "./demo/Demo.tsx";

function App() {
  const { t } = useTranslation();
  return (
    <>
      <Demo />
    </>
  );
}

export default App;
