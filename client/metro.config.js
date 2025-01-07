/*
module.exports = {
    watchFolders: [],
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    maxWorkers: 4, // İşçi sayısını sınırlayarak sistem yükünü azaltır
  };
  */
  const { getDefaultConfig } = require("@expo/metro-config");

  module.exports = getDefaultConfig(__dirname);
  
