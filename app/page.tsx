import HomeClient from "./HomeClient";
import CatTabWithPrefill from "./components/CatTabWithPrefill";

export default function Home() {
  return <HomeClient catTab={<CatTabWithPrefill />} />;
}
