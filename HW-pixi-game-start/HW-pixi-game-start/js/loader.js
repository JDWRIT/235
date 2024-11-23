WebFont.load({
    google: {
      families: ["Press Start 2P"],
    },
    active: (e) => {
      console.log("Font loaded");
      loadImages();
    },
  });