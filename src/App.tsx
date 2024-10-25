import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  return (
    <>
      <div>{"你好"}</div>
    </>
  );
}

export default App;
