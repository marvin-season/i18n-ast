import Counter from "./components/Counter.tsx";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  return (
    <>
      <div>{"你好"}</div>
      <Counter />
    </>
  );
}

export default App;
