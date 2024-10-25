import { useTranslation } from "react-i18next";
import Counter from "./components/Counter.tsx";

function App() {
  const { t } = useTranslation();
  return (
    <>
      <div>{"你好"}</div>
      <Counter/>
    </>
  );
}

export default App;
