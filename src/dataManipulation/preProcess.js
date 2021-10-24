import * as PropTypes from "prop-types";

const bodyLinesScheme = [
  ["Ankle_Left", "Hip_Left", "Hip_Right", "Ankle_Right"],
  [
    "Hand_Left_Tip",
    "Hand_Left",
    "Elbow_Left",
    "Shoulder_Left",
    "Spine_Shoulder",
    "Shoulder_Right",
    "Elbow_Right",
    "Hand_Right",
    "Hand_Right_Tip",
  ],
  ["Head", "Spine_Shoulder", "Spine_Mid", "Hip_Mid"],
];

export const preProcess = ({ frames }) => {
  return frames.map((frame) => {
    return getSingleFramePoints({ frame });
  });
};
preProcess.propTypes = {
  frames: PropTypes.arrayOf(
    PropTypes.shape({
      frameAttributes: PropTypes.object,
    })
  ).isRequired,
};

export const getSingleFramePoints = ({ frame }) => {
  const attributes = frame.frameAttributes;

  attributes.Hip_Mid_X = (Number(attributes.Hip_Left_X) + Number(attributes.Hip_Right_X)) / 2;
  attributes.Hip_Mid_Y = (Number(attributes.Hip_Left_Y) + Number(attributes.Hip_Right_Y)) / 2;
  attributes.Hip_Mid_Z = (Number(attributes.Hip_Left_Z) + Number(attributes.Hip_Right_Z)) / 2;

  const points = {
    asObjects: [],
    asArrays: [],
    flat: [],
    bodyLines: bodyLinesScheme.map((_) => []),
  };

  const suffixes = {
    x: "_X",
    y: "_Y",
    z: "_Z",
  };

  const pointLabels = Object.keys(attributes)
    .map((l) =>
      l.replace(suffixes.x, "").replace(suffixes.y, "").replace(suffixes.z, "")
    )
    .filter((l) => l.toLowerCase().localeCompare("Volume".toLowerCase()))
    .reduce((uniqueLabels, l) => {
      if (!uniqueLabels.includes(l)) {
        uniqueLabels.push(l);
      }
      return uniqueLabels;
    }, []);

  for (const pointLabel of pointLabels) {
    const values = [
      getNumber(attributes[`${pointLabel}${suffixes.x}`]),
      getNumber(attributes[`${pointLabel}${suffixes.y}`]),
      getNumber(attributes[`${pointLabel}${suffixes.z}`]),
    ];
    const labeledValues = {
      label: pointLabel,
      x: values[0],
      y: values[1],
      z: values[2],
    };
    points.asObjects.push({
      label: pointLabel,
      x: values[0],
      y: values[1],
      z: values[2],
    });
    bodyLinesScheme.forEach((bodyLineScheme, i) => {
      if (bodyLineScheme.includes(pointLabel)) {
        points.bodyLines[i].push(labeledValues);
      }
    });

    points.asArrays.push(values);
    points.flat.push(...values);
  }
  points.bodyLines.forEach((bodyLine, i) => {
    return bodyLine.sort(function (a, b) {
      return (
        bodyLinesScheme[i].indexOf(a.label) -
        bodyLinesScheme[i].indexOf(b.label)
      );
    });
  });
  return points;
};
getSingleFramePoints.propTypes = {
  frame: PropTypes.shape({
    frameAttributes: PropTypes.object,
  }).isRequired,
};

const getNumber = n => Number(n) * 30;
