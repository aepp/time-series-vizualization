import * as PropTypes from "prop-types";
import dataSet from "../data/test_data.json";
import { preProcess } from "./dataManipulation/preProcess";
import { MyFirstThree } from "./experiments/myFirstThree";

function main({ dataSet }) {
  const data = preProcess({ frames: dataSet.Frames });
  const threeTest = new MyFirstThree();
  threeTest.init().initFrames({ frames: data }).animateFrames();
}
main.propTypes = {
  dataSet: PropTypes.shape({
    Frames: PropTypes.array,
  }).isRequired,
};

main({ dataSet });
