module.exports = {
    // ...other vue-cli plugin options...
    pwa: {
        name: 'functional-reactive-smarthome-ui',
        short_name: 'frs-ui',
        themeColor: '#272626',
        msTileColor: '#000000',
        backgroundColor: '#ffffff',
        manifestOptions: {
            icons: [
                {
                    src: "img/icons/android-chrome-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                }
            ]
        }
    }
};
