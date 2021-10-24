import { _3d as _3dLib } from "d3-3d";
import * as d3 from "d3";

export const Barchart3D = {
  run: () => {
    let origin = [480, 300],
      scale = 20,
      j = 10,
      cubesData = [],
      alpha = 0,
      beta = 0,
      startAngle = Math.PI / 6;
    let svg = d3
      .select("svg")
      .call(
        d3.drag().on("drag", dragged).on("start", dragStart).on("end", dragEnd)
      )
      .append("g");
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let cubesGroup = svg.append("g").attr("class", "cubes");
    let mx, my, mouseX, mouseY;

    let cubes3D = _3dLib()
      .shape("CUBE")
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      })
      .z(function (d) {
        return d.z;
      })
      .rotateY(startAngle)
      .rotateX(-startAngle)
      .origin(origin)
      .scale(scale);

    function processData(data, tt) {
      /* --------- CUBES ---------*/

      let cubes = cubesGroup.selectAll("g.cube").data(data, function (d) {
        return d.id;
      });

      let ce = cubes
        .enter()
        .append("g")
        .attr("class", "cube")
        .attr("fill", function (d) {
          return color(d.id);
        })
        .attr("stroke", function (d) {
          return d3.color(color(d.id)).darker(2);
        })
        .merge(cubes)
        .sort(cubes3D.sort);

      cubes.exit().remove();

      /* --------- FACES ---------*/

      let faces = cubes
        .merge(ce)
        .selectAll("path.face")
        .data(
          function (d) {
            return d.faces;
          },
          function (d) {
            return d.face;
          }
        );

      faces
        .enter()
        .append("path")
        .attr("class", "face")
        .attr("fill-opacity", 0.95)
        .classed("_3d", true)
        .merge(faces)
        .transition()
        .duration(tt)
        .attr("d", cubes3D.draw);

      faces.exit().remove();

      /* --------- TEXT ---------*/

      let texts = cubes
        .merge(ce)
        .selectAll("text.text")
        .data(function (d) {
          let _t = d.faces.filter(function (d) {
            return d.face === "top";
          });
          return [{ height: d.height, centroid: _t[0].centroid }];
        });

      texts
        .enter()
        .append("text")
        .attr("class", "text")
        .attr("dy", "-.7em")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bolder")
        .attr("x", function (d) {
          return origin[0] + scale * d.centroid.x;
        })
        .attr("y", function (d) {
          return origin[1] + scale * d.centroid.y;
        })
        .classed("_3d", true)
        .merge(texts)
        .transition()
        .duration(tt)
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("x", function (d) {
          return origin[0] + scale * d.centroid.x;
        })
        .attr("y", function (d) {
          return origin[1] + scale * d.centroid.y;
        })
        .tween("text", function (d) {
          let that = d3.select(this);
          let i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
          return function (t) {
            that.text(i(t).toFixed(1));
          };
        });

      texts.exit().remove();

      /* --------- SORT TEXT & FACES ---------*/

      ce.selectAll("._3d").sort(_3dLib().sort);
    }

    function init() {
      cubesData = [];
      let cnt = 0;
      for (let z = -j / 2; z <= j / 2; z = z + 5) {
        for (let x = -j; x <= j; x = x + 5) {
          let h = d3.randomUniform(-2, -7)();
          let _cube = makeCube(h, x, z);
          _cube.id = "cube_" + cnt++;
          _cube.height = h;
          cubesData.push(_cube);
        }
      }
      processData(cubes3D(cubesData), 1000);
    }

    function dragStart(event) {
      mx = event.x;
      my = event.y;
    }

    function dragged(event) {
      mouseX = mouseX || 0;
      mouseY = mouseY || 0;
      beta = ((event.x - mx + mouseX) * Math.PI) / 230;
      alpha = (((event.y - my + mouseY) * Math.PI) / 230) * -1;
      processData(
        cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(
          cubesData
        ),
        0
      );
    }

    function dragEnd(event) {
      mouseX = event.x - mx + mouseX;
      mouseY = event.y - my + mouseY;
    }

    function makeCube(h, x, z) {
      return [
        { x: x - 1, y: h, z: z + 1 }, // FRONT TOP LEFT
        { x: x - 1, y: 0, z: z + 1 }, // FRONT BOTTOM LEFT
        { x: x + 1, y: 0, z: z + 1 }, // FRONT BOTTOM RIGHT
        { x: x + 1, y: h, z: z + 1 }, // FRONT TOP RIGHT
        { x: x - 1, y: h, z: z - 1 }, // BACK  TOP LEFT
        { x: x - 1, y: 0, z: z - 1 }, // BACK  BOTTOM LEFT
        { x: x + 1, y: 0, z: z - 1 }, // BACK  BOTTOM RIGHT
        { x: x + 1, y: h, z: z - 1 }, // BACK  TOP RIGHT
      ];
    }

    d3.selectAll("button").on("click", init);

    init();
  },
};

export default Barchart3D;
