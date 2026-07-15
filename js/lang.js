const change_lang = {
    en: {
        title: "Hologram Project",
        faculty: "SCHOOL OF ENGINEERING MATHEMATICS & PHYSICS",
        select_below: "PLEASE SELECT BELOW",
        display_btn: "Display",
        guest_btn: "Guest Access",
        credits_btn: "Project Info",
        placeholder_code: "Enter 4-digit code",
        connect_btn: "Connect",
        guest_control: "Guest Control",
        obj_3d: "3D OBJECTS",
        knots: "KNOTS",
        curves: "CURVES",
        adjustments: "ADJUSTMENTS (SIZE & OFFSET)",
        scale: "Scale",
        lr_dist: "Left/Right Distance",
        top_dist: "Top Distance",
        side_y: "Side Objects Y-Axis",
        actions: "ACTIONS",
        change_color: "Change Colour",
        toggle_code: "Toggle Code Box",
        toggle_lines: "Toggle Cut Lines",
        toggle_lang: "Toggle Language",
        swipe_lr: "Swipe to rotate left/right",
        swipe_obj: "Swipe to rotate the object",
        go_back: "Go Back",
        special_thanks: "Special Thanks:"
    },

    it: {
        title: "Hologram Project",
        faculty: "SCHOOL OF ENGINEERING MATHEMATICS & PHYSICS",
        select_below: "PLEASE SELECT BELOW",
        display_btn: "Display",
        guest_btn: "Guest Access",
        credits_btn: "Project Info",
        placeholder_code: "Enter 4-digit code",
        connect_btn: "Connect",
        guest_control: "Guest Control",
        obj_3d: "3D OBJECTS",
        knots: "KNOTS",
        curves: "CURVES",
        adjustments: "ADJUSTMENTS (SIZE & OFFSET)",
        scale: "Scale",
        lr_dist: "Left/Right Distance",
        top_dist: "Top Distance",
        side_y: "Side Objects Y-Axis",
        actions: "ACTIONS",
        change_color: "Change Colour",
        toggle_code: "Toggle Code Box",
        toggle_lines: "Toggle Cut Lines",
        toggle_lang: "Toggle Language",
        swipe_lr: "Swipe to rotate left/right",
        swipe_obj: "Swipe to rotate the object",
        go_back: "Go Back",
        special_thanks: "Special Thanks:"
    },

};

function Change_Language(lang) {
    const elements = document.querySelectorAll('[data-lang]');
    
    elements.forEach((element) => {
        const key = element.getAttribute('data-lang');
        if (change_lang[lang] && change_lang[lang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = change_lang[lang][key];
            } else {
                element.innerText = change_lang[lang][key];
            }
        }
    });
    
    localStorage.setItem('myAppLanguage', lang);
    console.log("Language changed to: " + lang);
}

window.addEventListener('DOMContentLoaded', (event) => {
    const savedLang = localStorage.getItem('myAppLanguage') || 'en';
    Change_Language(savedLang);
});