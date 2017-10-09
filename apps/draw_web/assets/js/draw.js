import {setUpChannel} from "./channel"

// This is based heavily on MBostocks original work:
// https://bl.ocks.org/mbostock/f705fc55e6f26df29354

const init = (socket, root, id) => {
  console.log("Initialise Draw")

  const state = {
    count: 0
  }

  const channel = setUpChannel(socket, state, {id: id, fps: 60})

  const renderPath = ({id, path}) => `<path id="${id}" d="${path}"></path>`

  channel.on("drawing:update", response => {
    // console.log("drawing:update revieved", response)
    Object.keys(response).map((key) => {
      const payload = response[key].metas[0]
      const paths = payload["paths"];
      (paths||[]).map(({path}) => {
        const output = renderPath(path)
        document.querySelector(root)
         .insertAdjacentHTML('beforeend', output)
      })
    })
  })

  var line = d3.line()
      .curve(d3.curveBasis)

  var svg = d3.select(root)
      .call(d3.drag()
          .container(function(){
            // console.log(this)
            return this
          })
          .subject(function() {
            var p = [d3.event.x, d3.event.y];
            return [p, p];
          })
          .on("start", dragstarted)
          .on("end", dragstopped));

          // item.call(d3.drag()
          //     .on("start", (d, i) => this.dragstarted(d,i))
          //     .on("drag", (d, i) => this.dragged(d, i))
          //     .on("end", (d, i) => this.dragended(d, i))
          // );

  function dragstarted() {
    var d = d3.event.subject,
        active = svg.append("path").datum(d),
        x0 = d3.event.x,
        y0 = d3.event.y;

    d3.event.on("drag", function() {
      var x1 = d3.event.x,
          y1 = d3.event.y,
          dx = x1 - x0,
          dy = y1 - y0;

      if (dx * dx + dy * dy > 10) d.push([x0 = x1, y0 = y1]);
      else d[d.length - 1] = [x1, y1];
      // console.log(d)
      active.attr("d", line);
    });
  }

  function dragstopped(d, i, o) {
    // console.log("Drag stopped, send an update", o[0])
    var query = "#drawing svg path:last-child"
    var element = document.body.querySelector(query)
    var path = element.getAttribute("d")
    state.count++
    channel.push("drawing:update", {path: {id: state.count, path: path}})
  }

}

export default {init: init}
