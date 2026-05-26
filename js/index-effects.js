document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rand = (min, max) => min + Math.random() * (max - min);

    const setupCanvas = (canvas) => {
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
            return null;
        }

        let w = 0;
        let h = 0;
        let dpr = 1;
        let running = false;
        let rafId = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            w = Math.max(1, rect.width);
            h = Math.max(1, rect.height);
            dpr = window.devicePixelRatio || 1;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
        };

        const start = (drawFn) => {
            resize();

            if (prefersReducedMotion) {
                drawFn(0, true);
                return;
            }

            let lastTime = 0;
            const tick = (time) => {
                if (!running) {
                    return;
                }
                const dt = time - lastTime;
                lastTime = time;
                drawFn(time, false, dt);
                rafId = requestAnimationFrame(tick);
            };

            running = true;
            rafId = requestAnimationFrame((time) => {
                lastTime = time;
                tick(time);
            });
        };

        const stop = () => {
            running = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };

        const observeVisibility = () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!running && !prefersReducedMotion) {
                            start(drawFnRef.current);
                        }
                    } else {
                        stop();
                    }
                });
            }, { threshold: 0.05 });

            observer.observe(canvas);
        };

        const drawFnRef = { current: null };
        let onResizeExtra = null;

        const init = (drawFn, options = {}) => {
            drawFnRef.current = (time, isStatic, dt) => {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                drawFn(ctx, w, h, time, isStatic, dt);
            };

            const handleResize = () => {
                resize();
                if (onResizeExtra) {
                    onResizeExtra(w, h);
                }
            };

            resize();
            window.addEventListener("resize", handleResize, { passive: true });

            if (prefersReducedMotion) {
                drawFnRef.current(0, true, 0);
            } else if (options.alwaysRun) {
                start(drawFnRef.current);
            } else {
                observeVisibility();
            }

            return {
                setOnResize(fn) {
                    onResizeExtra = fn;
                }
            };
        };

        return { init };
    };

    const initHeroAurora = (canvas) => {
        const api = setupCanvas(canvas);
        if (!api) {
            return;
        }

        const particles = Array.from({ length: 48 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: rand(1.2, 3.2),
            speed: rand(0.04, 0.12),
            phase: rand(0, Math.PI * 2)
        }));

        api.init((ctx, w, h, time) => {
            ctx.clearRect(0, 0, w, h);

            const t = time * 0.001;
            const gradient = ctx.createLinearGradient(0, 0, w, h);
            gradient.addColorStop(0, "#0b1430");
            gradient.addColorStop(0.45, "#162454");
            gradient.addColorStop(1, "#0f1a38");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            ctx.globalCompositeOperation = "lighter";
            for (let i = 0; i < 3; i += 1) {
                const cx = w * (0.2 + i * 0.3) + Math.sin(t * 0.35 + i) * 40;
                const cy = h * (0.35 + i * 0.12) + Math.cos(t * 0.28 + i) * 30;
                const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.35);
                glow.addColorStop(0, `rgba(${80 + i * 40}, ${120 + i * 20}, 255, 0.18)`);
                glow.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, w, h);
            }

            particles.forEach((particle) => {
                const px = particle.x * w + Math.sin(t * particle.speed + particle.phase) * 18;
                const py = particle.y * h + Math.cos(t * particle.speed * 0.9 + particle.phase) * 14;
                ctx.fillStyle = "rgba(180, 210, 255, 0.55)";
                ctx.beginPath();
                ctx.arc(px, py, particle.r, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalCompositeOperation = "source-over";
        }, { alwaysRun: true });
    };

    const initNeuralNetwork = (canvas) => {
        const api = setupCanvas(canvas);
        if (!api) {
            return;
        }

        let nodes = [];
        let links = [];

        const build = (w, h) => {
            nodes = [];
            links = [];
            const cols = Math.max(4, Math.floor(w / 90));
            const rows = Math.max(3, Math.floor(h / 80));
            const marginX = w * 0.08;
            const marginY = h * 0.12;
            const spanX = w - marginX * 2;
            const spanY = h - marginY * 2;

            for (let r = 0; r < rows; r += 1) {
                for (let c = 0; c < cols; c += 1) {
                    const x = marginX + (c * spanX) / Math.max(1, cols - 1);
                    const y = marginY + (r * spanY) / Math.max(1, rows - 1);
                    nodes.push({
                        baseX: x,
                        baseY: y,
                        amp: rand(2, 5),
                        speed: rand(0.6, 1.1),
                        phase: rand(0, Math.PI * 2),
                        x,
                        y
                    });
                }
            }

            const linkDist = Math.min(160, Math.max(90, Math.min(w, h) * 0.28));
            for (let i = 0; i < nodes.length; i += 1) {
                for (let j = i + 1; j < nodes.length; j += 1) {
                    const dist = Math.hypot(nodes[i].baseX - nodes[j].baseX, nodes[i].baseY - nodes[j].baseY);
                    if (dist <= linkDist) {
                        links.push({ a: i, b: j, phase: rand(0, Math.PI * 2) });
                    }
                }
            }
        };

        const controller = api.init((ctx, w, h, time) => {
            if (!nodes.length) {
                build(w, h);
            }

            ctx.clearRect(0, 0, w, h);
            const t = time * 0.001;

            nodes.forEach((node) => {
                node.x = node.baseX + Math.sin(t * node.speed + node.phase) * node.amp;
                node.y = node.baseY + Math.cos(t * node.speed + node.phase) * node.amp;
            });

            ctx.globalCompositeOperation = "lighter";
            links.forEach((link) => {
                const a = nodes[link.a];
                const b = nodes[link.b];
                const activity = 0.4 + 0.6 * Math.sin(t * 1.4 + link.phase);
                ctx.strokeStyle = `rgba(80, 190, 255, ${0.22 * activity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            });

            nodes.forEach((node) => {
                const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + node.phase);
                ctx.fillStyle = `rgba(200, 235, 255, ${0.35 + pulse * 0.35})`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.2 + pulse, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalCompositeOperation = "source-over";
        });

        controller.setOnResize(() => {
            nodes = [];
            links = [];
        });
    };

    const initWireframe = (canvas) => {
        const api = setupCanvas(canvas);
        if (!api) {
            return;
        }

        const project = (point, w, h, angleX, angleY) => {
            let x = point[0];
            let y = point[1];
            let z = point[2];

            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const nx = x * cosY - z * sinY;
            const nz = x * sinY + z * cosY;
            x = nx;
            z = nz;

            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const ny = y * cosX - z * sinX;
            const nz2 = y * sinX + z * cosX;
            y = ny;
            z = nz2;

            const scale = 120 / (z + 4);
            return {
                x: w * 0.5 + x * scale,
                y: h * 0.5 + y * scale
            };
        };

        const cubeVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const cubeEdges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        api.init((ctx, w, h, time) => {
            ctx.clearRect(0, 0, w, h);
            const t = time * 0.001;
            const angleX = t * 0.7;
            const angleY = t * 0.55;

            ctx.strokeStyle = "rgba(255, 170, 90, 0.75)";
            ctx.lineWidth = 1.2;
            cubeEdges.forEach(([a, b]) => {
                const p1 = project(cubeVertices[a], w, h, angleX, angleY);
                const p2 = project(cubeVertices[b], w, h, angleX, angleY);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            });

            ctx.strokeStyle = "rgba(120, 200, 255, 0.25)";
            for (let i = 0; i < 6; i += 1) {
                const y = h * (0.15 + i * 0.14);
                ctx.beginPath();
                ctx.moveTo(0, y + Math.sin(t + i) * 4);
                ctx.lineTo(w, y + Math.cos(t * 0.8 + i) * 4);
                ctx.stroke();
            }
        });
    };

    const initCodeFlow = (canvas) => {
        const api = setupCanvas(canvas);
        if (!api) {
            return;
        }

        const chars = "01{}[]<>/=+-;const let fn return import class";
        let columns = [];

        const build = (width, height) => {
            const count = Math.max(8, Math.floor(width / 28));
            columns = Array.from({ length: count }, (_, i) => ({
                x: (i + 0.5) * (width / count),
                y: rand(-height, 0),
                speed: rand(40, 110),
                size: rand(10, 14),
                text: chars[Math.floor(Math.random() * chars.length)]
            }));
        };

        const controller = api.init((ctx, w, h, time, isStatic, dt) => {
            if (!columns.length) {
                build(w, h);
            }

            ctx.fillStyle = "rgba(8, 11, 20, 0.18)";
            ctx.fillRect(0, 0, w, h);

            const step = isStatic ? 0 : (dt || 16) * 0.001;
            columns.forEach((column) => {
                column.y += column.speed * step;
                if (column.y > h + 20) {
                    column.y = rand(-80, -10);
                    column.text = chars[Math.floor(Math.random() * chars.length)];
                }

                ctx.fillStyle = "rgba(90, 255, 170, 0.75)";
                ctx.font = `${column.size}px monospace`;
                ctx.fillText(column.text, column.x, column.y);
            });
        });

        controller.setOnResize((width, height) => {
            build(width, height);
        });
    };

    const initTimelineWave = (canvas) => {
        const api = setupCanvas(canvas);
        if (!api) {
            return;
        }

        api.init((ctx, w, h, time) => {
            ctx.clearRect(0, 0, w, h);
            const t = time * 0.001;

            for (let i = 0; i < 5; i += 1) {
                const y = h * (0.25 + i * 0.12);
                ctx.strokeStyle = `rgba(255, 120, 180, ${0.25 + i * 0.08})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x <= w; x += 6) {
                    const wave = Math.sin(x * 0.02 + t * 2 + i) * 10;
                    if (x === 0) {
                        ctx.moveTo(x, y + wave);
                    } else {
                        ctx.lineTo(x, y + wave);
                    }
                }
                ctx.stroke();
            }

            const playhead = (t * 80) % w;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playhead, h * 0.15);
            ctx.lineTo(playhead, h * 0.85);
            ctx.stroke();

            for (let i = 0; i < 8; i += 1) {
                const bx = (i / 8) * w + 8;
                const bw = w / 10;
                ctx.fillStyle = `rgba(120, 180, 255, ${0.18 + (i % 2) * 0.08})`;
                ctx.fillRect(bx, h * 0.78, bw, 10);
            }
        });
    };

    const initLifePath = (canvas) => {
        const api = setupCanvas(canvas);
        if (!api) {
            return;
        }

        let points = [];

        const build = () => {
            const count = 7;
            points = Array.from({ length: count }, (_, i) => ({
                x: 0.12 + (i / (count - 1)) * 0.76,
                y: 0.55 + Math.sin(i * 0.9) * 0.12,
                phase: rand(0, Math.PI * 2)
            }));
        };

        build();

        api.init((ctx, w, h, time) => {
            ctx.clearRect(0, 0, w, h);
            const t = time * 0.001;

            ctx.strokeStyle = "rgba(180, 210, 255, 0.35)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            points.forEach((point, index) => {
                const px = point.x * w;
                const py = point.y * h + Math.sin(t + point.phase) * 6;
                if (index === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            });
            ctx.stroke();

            points.forEach((point, index) => {
                const px = point.x * w;
                const py = point.y * h + Math.sin(t + point.phase) * 6;
                ctx.fillStyle = index === points.length - 1 ? "rgba(255, 210, 120, 0.9)" : "rgba(120, 190, 255, 0.85)";
                ctx.beginPath();
                ctx.arc(px, py, index === points.length - 1 ? 5 : 4, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    };

    const effectMap = {
        "hero-aurora": initHeroAurora,
        "neural-network": initNeuralNetwork,
        wireframe: initWireframe,
        "code-flow": initCodeFlow,
        "timeline-wave": initTimelineWave,
        "life-path": initLifePath
    };

    const heroCanvas = document.querySelector(".hero-effect-canvas");
    if (heroCanvas) {
        initHeroAurora(heroCanvas);
    }

    document.querySelectorAll(".visual-effect-canvas").forEach((canvas) => {
        const effect = canvas.dataset.effect;
        const initFn = effectMap[effect];
        if (initFn) {
            initFn(canvas);
        }
    });
});
