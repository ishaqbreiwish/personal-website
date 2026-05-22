(function () {
  if (typeof d3 === 'undefined' || !window.GRAPH_DATA) return;

  var data = window.GRAPH_DATA;

  function cssVar(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }

  function nodeRadius(d, scale) {
    scale = scale || 1;
    if (d.type === 'root') return 7 * scale;
    if (d.type === 'section') return 5 * scale;
    return 3.5 * scale;
  }

  function nodeColor(d) {
    if (d.type === 'root' || d.type === 'section') return cssVar('--accent');
    return cssVar('--text-muted');
  }

  function buildGraph(svgEl, opts) {
    var w = svgEl.getBoundingClientRect().width;
    var h = svgEl.getBoundingClientRect().height;
    if (!w || !h) return;

    var mini = opts.mini;
    var scale = mini ? 0.75 : 1;

    /* Deep-copy nodes/links so simulations don't share state */
    var nodes = data.nodes.map(function (n) { return Object.assign({}, n); });
    var links = data.links.map(function (l) { return Object.assign({}, l); });

    var svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', [0, 0, w, h]);

    var g = svg.append('g');

    svg.call(
      d3.zoom()
        .scaleExtent([0.1, 8])
        .on('zoom', function (e) { g.attr('transform', e.transform); })
    );

    var sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(function (d) { return d.id; })
        .distance(function (l) { return l.type === 'tag' ? 70 : (mini ? 40 : 60); })
        .strength(function (l) { return l.type === 'tag' ? 0.25 : 0.7; }))
      .force('charge', d3.forceManyBody().strength(mini ? -80 : -160))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collide', d3.forceCollide(function (d) { return nodeRadius(d, scale) + (mini ? 4 : 7); }));

    /* Links */
    var link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', cssVar('--border'))
      .attr('stroke-width', function (l) { return l.type === 'tag' ? 0.5 : (mini ? 0.8 : 1); })
      .attr('stroke-dasharray', function (l) { return l.type === 'tag' ? '2 2' : null; })
      .attr('stroke-opacity', 0.7);

    /* Nodes */
    var node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', function (e, d) {
          if (!e.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function (e, d) { d.fx = e.x; d.fy = e.y; })
        .on('end', function (e, d) {
          if (!e.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      )
      .on('click', function (e, d) {
        if (!e.defaultPrevented && d.url) window.location.href = d.url;
      });

    node.append('circle')
      .attr('r', function (d) { return nodeRadius(d, scale); })
      .attr('fill', nodeColor)
      .attr('fill-opacity', function (d) {
        /* Highlight current page */
        if (d.id === data.current) return 1;
        return d.type === 'root' || d.type === 'section' ? 0.85 : 0.6;
      })
      .attr('stroke', function (d) {
        return d.id === data.current ? cssVar('--accent') : cssVar('--bg');
      })
      .attr('stroke-width', function (d) { return d.id === data.current ? 2 : 1.5; });

    /* Labels: always on for root/section in full mode; hover-only in mini */
    if (!mini) {
      node.append('text')
        .text(function (d) { return d.label; })
        .attr('text-anchor', 'middle')
        .attr('dy', function (d) { return -(nodeRadius(d, scale) + 5); })
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', function (d) {
          if (d.type === 'root') return '11px';
          if (d.type === 'section') return '10px';
          return '9px';
        })
        .attr('fill', function (d) {
          return d.type === 'root' || d.type === 'section' ? cssVar('--accent') : cssVar('--text-muted');
        })
        .attr('opacity', function (d) {
          return d.type === 'root' || d.type === 'section' || d.id === data.current ? 1 : 0;
        })
        .attr('pointer-events', 'none')
        .attr('class', 'node-label');

      /* Hover */
      node
        .on('mouseenter', function (e, d) {
          d3.select(this).select('.node-label').attr('opacity', 1);
          link.attr('stroke-opacity', function (l) {
            var s = typeof l.source === 'object' ? l.source.id : l.source;
            var t = typeof l.target === 'object' ? l.target.id : l.target;
            return s === d.id || t === d.id ? 1 : 0.1;
          });
          node.attr('opacity', function (n) {
            if (n.id === d.id) return 1;
            var conn = links.some(function (l) {
              var s = typeof l.source === 'object' ? l.source.id : l.source;
              var t = typeof l.target === 'object' ? l.target.id : l.target;
              return (s === d.id && t === n.id) || (t === d.id && s === n.id);
            });
            return conn ? 1 : 0.2;
          });
        })
        .on('mouseleave', function (e, d) {
          d3.select(this).select('.node-label').attr('opacity', function () {
            return d.type === 'root' || d.type === 'section' || d.id === data.current ? 1 : 0;
          });
          link.attr('stroke-opacity', 0.7);
          node.attr('opacity', 1);
        });
    }

    /* Tick */
    sim.on('tick', function () {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
      node.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });

    return { sim: sim, svg: svg };
  }

  /* Init mini graph (sidebar) */
  var miniEl = document.getElementById('mini-graph-svg');
  if (miniEl) {
    buildGraph(miniEl, { mini: true });
  }

  /* Init full graph (/graph page) */
  var fullEl = document.getElementById('graph-svg');
  if (fullEl) {
    var fg = buildGraph(fullEl, { mini: false });
    if (fg) {
      window.addEventListener('resize', function () {
        buildGraph(fullEl, { mini: false });
      });
    }
  }
})();
