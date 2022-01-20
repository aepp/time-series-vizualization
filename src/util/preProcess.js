import * as PropTypes from "prop-types";

const startsWithNumberAndOptUnderscoreRegex = new RegExp(/^[\d]+_*/);
const endsWithSingleCharacterAndUnderscoreRegex = new RegExp(/_[XYZ]$/);

const suffixes = {
  x: "_X",
  y: "_Y",
  z: "_Z",
};

const keyPoints = {
  AnkleRight: "Ankle_Right",
  AnkleLeft: "Ankle_Left",
  ElbowRight: "Elbow_Right",
  ElbowLeft: "Elbow_Left",
  HandRight: "Hand_Right",
  HandLeft: "Hand_Left",
  HandRightTip: "Hand_Right_Tip",
  HandLeftTip: "Hand_Left_Tip",
  Head: "Head",
  HipRight: "Hip_Right",
  HipMid: "Hip_Mid",
  HipLeft: "Hip_Left",
  ShoulderRight: "Shoulder_Right",
  ShoulderLeft: "Shoulder_Left",
  SpineMid: "Spine_Mid",
  SpineShoulder: "Spine_Shoulder",
};
const bodyLinesScheme = [
  [
    keyPoints.AnkleLeft,
    keyPoints.AnkleLeft.replaceAll("_", ""),
    keyPoints.HipLeft,
    keyPoints.HipLeft.replaceAll("_", ""),
    keyPoints.HipRight,
    keyPoints.HipRight.replaceAll("_", ""),
    keyPoints.AnkleRight,
    keyPoints.AnkleRight.replaceAll("_", ""),
  ],
  [
    keyPoints.HandLeftTip,
    keyPoints.HandLeftTip.replaceAll("_", ""),
    keyPoints.HandLeft,
    keyPoints.HandLeft.replaceAll("_", ""),
    keyPoints.ElbowLeft,
    keyPoints.ElbowLeft.replaceAll("_", ""),
    keyPoints.ShoulderLeft,
    keyPoints.ShoulderLeft.replaceAll("_", ""),
    keyPoints.SpineShoulder,
    keyPoints.SpineShoulder.replaceAll("_", ""),
    keyPoints.ShoulderRight,
    keyPoints.ShoulderRight.replaceAll("_", ""),
    keyPoints.ElbowRight,
    keyPoints.ElbowRight.replaceAll("_", ""),
    keyPoints.HandRight,
    keyPoints.HandRight.replaceAll("_", ""),
    keyPoints.HandRightTip,
    keyPoints.HandRightTip.replaceAll("_", ""),
  ],
  [
    keyPoints.Head,
    keyPoints.SpineShoulder,
    keyPoints.SpineShoulder.replaceAll("_", ""),
    keyPoints.SpineMid,
    keyPoints.SpineMid.replaceAll("_", ""),
    keyPoints.HipMid,
    keyPoints.HipMid.replaceAll("_", ""),
  ],
];

const notEmptyFrame = (allPersonsPoints) => {
  // e.g. allPersonsPoints = [{...points of person 1}, {...points of person 2}, ...]
  return (
    allPersonsPoints.length > 0 &&
    allPersonsPoints.reduce(
      (notEmpty, singlePersonPoints) => Boolean(singlePersonPoints) || notEmpty,
      false
    )
  );
};
export const preProcess = async ({ frames }) => {
  const personIndices = getPersonIndices({ frames });
  // return frames.slice(1000, 1005).map((frame) => {
  return frames
    .slice(2127, frames.length -1)
    .map((frame) => processFrame({ frame, personIndices }))
    .filter(notEmptyFrame);
};
preProcess.propTypes = {
  frames: PropTypes.arrayOf(
    PropTypes.shape({
      frameAttributes: PropTypes.object,
    })
  ).isRequired,
};

export const getSingleFramePointsForPerson = ({
  attributes,
  pointLabels,
  personIdx,
}) => {
  const points = {
    asObjects: [],
    asArrays: [],
    flat: [],
    bodyLines: bodyLinesScheme.map((_) => []),
  };

  let zeroPointsCounter = 0;
  for (const pointLabel of pointLabels) {
    const values = [
      scale(
        getKnownAttributeValue({
          attributes,
          personIdx,
          pointLabel,
          suffix: suffixes.x,
        })
      ),
      scale(
        getKnownAttributeValue({
          attributes,
          personIdx,
          pointLabel,
          suffix: suffixes.y,
        })
      ),
      scale(
        getKnownAttributeValue({
          attributes,
          personIdx,
          pointLabel,
          suffix: suffixes.z,
        })
      ),
    ];
    if (values.reduce((flag, v) => isNaN(v), false)) continue;
    zeroPointsCounter += values.reduce((sum, v) => sum + (v === 0 && 1 / 3), 0);
    if (zeroPointsCounter > 3) break;

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

  if (zeroPointsCounter > 3) return null;

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
getSingleFramePointsForPerson.propTypes = {
  attributes: PropTypes.object.isRequired,
  pointLabels: PropTypes.array.isRequired,
  personIdx: PropTypes.number.isRequired,
};

export const processFrame = ({ frame, personIndices }) => {
  const attributes = frame.frameAttributes;
  setHipMidPoint({ attributes, personIndices });

  const pointLabels = Object.keys(attributes)
    .map((l) =>
      l
        .replace(endsWithSingleCharacterAndUnderscoreRegex, "")
        .replace(startsWithNumberAndOptUnderscoreRegex, "")
    )
    .filter(filterAttributes)
    .reduce((uniqueLabels, l) => {
      if (!uniqueLabels.includes(l)) {
        uniqueLabels.push(l);
      }
      return uniqueLabels;
    }, []);

  const pointsPerPerson = [];
  for (const personIdx of personIndices) {
    const points = getSingleFramePointsForPerson({
      attributes,
      pointLabels,
      personIdx,
    });

    if (!points) continue;
    pointsPerPerson.push({
      personIdx,
      points,
    });
  }
  // console.log(attributes);
  return pointsPerPerson;
};
processFrame.propTypes = {
  frame: PropTypes.shape({
    frameAttributes: PropTypes.object,
  }).isRequired,
  personIndices: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const scale = (n) => n * 30;

const filterAttributes = (l) =>
  l.toLowerCase().localeCompare("Volume".toLowerCase());

const getPersonIndices = ({ frames }) => {
  const personIndices = [];
  frames.map((f) =>
    Object.keys(f.frameAttributes).forEach((attributeKey) => {
      const idx = Number((attributeKey.match(/^[\d]/) || [])[0] || 0);
      personIndices[idx] = idx;
    })
  );
  return personIndices;
};

const setHipMidPoint = ({ attributes, personIndices }) => {
  for (const personIdx of personIndices) {
    attributes[`${personIdx}_${keyPoints.HipMid}${suffixes.x}`] =
      (getUnsureAttributeValue({
        attributes,
        personIdx,
        pointLabel: keyPoints.HipLeft,
        suffix: suffixes.x,
      }) +
        getUnsureAttributeValue({
          attributes,
          personIdx,
          pointLabel: keyPoints.HipRight,
          suffix: suffixes.x,
        })) /
      2;
    attributes[`${personIdx}_${keyPoints.HipMid}${suffixes.y}`] =
      (getUnsureAttributeValue({
        attributes,
        personIdx,
        pointLabel: keyPoints.HipLeft,
        suffix: suffixes.y,
      }) +
        getUnsureAttributeValue({
          attributes,
          personIdx,
          pointLabel: keyPoints.HipRight,
          suffix: suffixes.y,
        })) /
      2;
    attributes[`${personIdx}_${keyPoints.HipMid}${suffixes.z}`] =
      (getUnsureAttributeValue({
        attributes,
        personIdx,
        pointLabel: keyPoints.HipLeft,
        suffix: suffixes.z,
      }) +
        getUnsureAttributeValue({
          attributes,
          personIdx,
          pointLabel: keyPoints.HipRight,
          suffix: suffixes.z,
        })) /
      2;
  }

  return attributes;
};

const getKnownAttributeValue = ({
  attributes,
  personIdx,
  pointLabel,
  suffix,
}) =>
  Number(
    attributes[`${personIdx}_${pointLabel}${suffix}`] ||
      attributes[`${personIdx}${pointLabel}${suffix}`] ||
      attributes[`${pointLabel}${suffix}`]
  );
const getUnsureAttributeValue = ({
  attributes,
  personIdx,
  pointLabel,
  suffix,
}) =>
  [pointLabel, pointLabel.replaceAll("_", "")].reduce(
    (v, label) =>
      getKnownAttributeValue({
        attributes,
        personIdx,
        pointLabel: label,
        suffix,
      }),
    NaN
  );
