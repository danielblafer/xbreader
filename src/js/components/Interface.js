import m from "mithril";
import Logo from "../partials/Logo";

export default class Interface {
    oninit() {
        console.log("Interface initialized");
    }

    sliderMove(e, slider, publication) {
        e.redraw = false;
        if(publication.isTtb)
            window.scrollTo(0, slider.selector.scrollHeight * e.target.value / 100);
        else
            slider.goTo(parseInt(e.target.value));
    }

    slider(slider, publication) {
        const attrs = {
            type: "range",
            min: 0,
            max: slider.length - (slider.config.shift ? 1 : 2),//(slider.length % 2 ?  : slider.length),
            value: slider.currentSlide,
            step: slider.perPage,
            title: __("Select Page"),
            onchange: (e) => { // Activates when slider is released (mouse let go). Needed for IE compatibility
                this.sliderMove(e, slider, publication);
                e.target.blur();
            },
            oninput: (e) => { // Triggered on slider value changed (while dragging it!), works in evergreen browsers
                this.sliderMove(e, slider, publication);
            },
            dir: publication.rtl ? "rtl" : "ltr"
        };
        if(publication.isTtb) {
            attrs.max = 100;
            attrs.value = (document.documentElement.scrollTop + document.body.scrollTop) / document.documentElement.scrollHeight * 100;
            attrs.step = "any";
        }
        return m("input.br-slider", attrs);
    }

    sliderSystem(slider, publication) {        
        let items = [
            this.slider(slider, publication)
        ];

        const currentPageIndicator = m("span.br-slider__pagenum", {
            title: __("Current Page"),
            onclick: () => {
                const newPage = parseInt(prompt(`${__("Input a page number")} (${1}-${publication.pmetadata.numberOfPages})`, slider.currentSlide + 1)) - 1;
                if(newPage !== (slider.currentSlide + 1) && newPage >= 0 && newPage < publication.pmetadata.numberOfPages)
                    slider.goTo(newPage);
            }
        }, publication.navi.getPageString(slider));
        const pageAmountIndicator = m("span.br-slider__pagenum-last", {
            title: __("# of Pages")
        }, publication.pmetadata.numberOfPages);

        if(publication.rtl) {
            items.unshift(pageAmountIndicator);
            items.push(currentPageIndicator);
        } else {
            items.unshift(currentPageIndicator);
            if(!publication.isTtb)
                items.push(pageAmountIndicator);
        }

        const sseries = publication.pmetadata.xbr.series;
        if(sseries && sseries.next) { // Has a next chapter
            const nextLink = [
                m(`span.br-slider__${publication.rtl ? "lgo" : "rgo"}`, { // Leftmost slider control
                    title: __("Go to the next chapter")
                }, m("a", {
                    href: "/" + sseries.next.uuid,
                    oncreate: m.route.link({ replace: false }),
                    onupdate: m.route.link({ replace: false })
                }, __("Next")))
            ];
            if(publication.rtl)
                items.unshift(nextLink);
            else
                items.push(nextLink);
        }
        if(sseries && sseries.prev) {
            const prevLink = [ // Has a previous chapter
                m(`span.br-slider__${publication.rtl ? "rgo" : "lgo"}`, {
                    title: __("Go to the previous chapter")
                }, m("a", {
                    href: "/" + sseries.prev.uuid,
                    oncreate: m.route.link({ replace: false }),
                    onupdate: m.route.link({ replace: false })
                }, __("Prev")))
            ];
            if(publication.rtl)
                items.push(prevLink);
            else
                items.unshift(prevLink);
        }
        return m("div.br-botbar-container", items);
    }

    view(vnode) {
        const ui = vnode.attrs.model;
        const brand = vnode.attrs.reader.config.brand;
        const tabConfig = vnode.attrs.reader.config.tabs;
        const slider = vnode.attrs.reader.slider;
        const publication = vnode.attrs.reader.publication;
        slider.resolveSlidesNumber();
        const isPortrait = window.innerHeight > window.innerWidth ? true : false;

        let tweakButton = [];
        if (slider.config.ttb) // Vertical tweaking
            tweakButton = m("button#br-view__tweak", {
                onclick: () => {
                    slider.config.fit = !slider.config.fit;
                },
                title: slider.config.fit ? __("Fit to width") : __("Fit to height"),
            }, [
                m("i", {
                    class: slider.config.fit ? "br-i-wide" : "br-i-thin"
                })
            ]);
        else // Horizontal tweaking
            tweakButton = m("button#br-view__tweak", {
                onclick: () => {
                    if (slider.config.perPage == 1) {
                        slider.config.perPage = 2;
                        slider.currentSlide++;
                        if (slider.currentSlide % 2) // Prevent getting out of track
                            slider.prev();
                    } else {
                        slider.config.perPage = 1;
                        if(slider.currentSlide > 1) slider.currentSlide--;
                    }
                    slider.resizeHandler();
                },
                title: slider.single ? __("Spread view") : __("Single page view"),
            }, [
                m("i", {
                    class: slider.single ? "br-i-spread" : "br-i-single"
                })
            ]);

        const tabs = [];
        const tabBar = [];
        const tabToggle = [];
        tabConfig.forEach(tab => {
            tabs.push(m("a.br-tab", {
                title: tab.title,
                href: tab.href
            }, [
                m(`i.br-i-${tab.icon}`, {
                    "aria-hidden": "true"
                })
            ]));
        });
        if(tabs.length > 0) { // Tabs exist, show tab functionality
            tabToggle.push(m("button.br-tab.br-cmenu__toggle", {
                title: __("Menu"),
                onclick: () => {
                    ui.toggleMenu();
                }
            }, [
                m("i.br-i-apps", {
                    "aria-hidden": "true"
                })
            ]));
            tabBar.push(m("nav.br-tab-bar", tabs));
        }
        return [
            m("div.noselect#br-topbar", {
                class: ui.isHidden ? "hidden" : "shown"
            }, [
                m("div.br-topbar__row", [
                    m("section.br-toolbar__section.br-toolbar__section--align-start", [
                        m("a.logo[href=/]", [
                            m(Logo, brand)
                        ])
                    ]),
                    m("section.br-toolbar__tsection", [
                        m("a", {
                            href: publication.series.identifier,
                            title: __("Series")
                        }, publication.series.name),
                        m("span.spacer", "›"),
                        vnode.attrs.reader.series.selector
                    ]),
                    m("section.br-toolbar__section.br-toolbar__section--align-end.dhide", [
                        m("div", [
                            m("nav.br-tab-bar", tabToggle)
                        ])
                    ]),
                    m("section.br-toolbar__section.br-toolbar__section--align-end.br-cmenu", {
                        class: ui.menuShown ? "shown" : "gone"
                    }, [
                        m("div", tabBar)
                    ])
                ])
            ]),
            m("div#br-botbar.noselect", {
                class: ui.isHidden ? "hidden" : "shown"
            }, [
                this.sliderSystem(slider, publication),
                m("div.br-botbar-controls", {
                    class: isPortrait ? "portrait" : "landscape",
                    style: publication.isTtb ? "display: none;" : null,
                }, [
                    tweakButton,
                    m("button#br-view__rvm", {
                        title: "",
                        onclick: () => {
                            const reader = vnode.attrs.reader;
                            reader.zoomer.scale = 1;
                            reader.switchDirection();
                        }
                    }, [
                        m("i#br-view__toggle", {
                            title: __("Toggle reading direction"),
                            class: slider.config.ttb ? "br-i-horizontal" : "br-i-vertical"
                        })
                    ])
                ])
            ])
        ];
    }
}