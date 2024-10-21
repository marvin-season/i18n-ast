import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  return <>{t("common.api.success")}</>;
}

export default App;
