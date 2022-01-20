import * as PropTypes from "prop-types";
import dataSet1 from "../data/cpr.json";
import dataSet2 from "../data/table_tennis.json";
import { preProcess } from "./util/preProcess";
import { ModelController } from "./controller/ModelController";

let isInitialized = false;
async function main({ dataSet }) {
  const frames = dataSet.Frames || dataSet.frames;
  console.log("dataset loaded, beginning pre-process...");
  preProcess({ frames }).then((data) => {
    console.log("pre-process finished! rendering...");
    isInitialized = true;
    // console.log(data);
    const threeTest = new ModelController();
    threeTest
      .init()
      .initFrames({ framesPerPerson: data, framesCount: data.length })
      .animateFrames();
  });
  console.log("processing dataset...");
}
main.propTypes = {
  dataSet: PropTypes.shape({
    Frames: PropTypes.array,
  }).isRequired,
};

// main({ dataSet: dataSet1 });
main({ dataSet: dataSet2 })
  .then((_) => console.log("visualization finished!"))
  .catch((error) => console.error("Visualization failed:", error));
