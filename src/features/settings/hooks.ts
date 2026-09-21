import { useSettingsStore } from "./store";

export function useSettings() {
  return useSettingsStore();
}

export function useDistractionApps() {
  const { distractionProfile, setDistractionProfile } = useSettingsStore();

  const addDistractionApp = (pkg: string) => {
    if (!distractionProfile.distractingApps.includes(pkg)) {
      setDistractionProfile({
        ...distractionProfile,
        distractingApps: [...distractionProfile.distractingApps, pkg],
      });
    }
  };

  const removeDistractionApp = (pkg: string) => {
    setDistractionProfile({
      ...distractionProfile,
      distractingApps: distractionProfile.distractingApps.filter((a) => a !== pkg),
    });
  };

  const addAllowedApp = (pkg: string) => {
    if (!distractionProfile.allowedApps.includes(pkg)) {
      setDistractionProfile({
        ...distractionProfile,
        allowedApps: [...distractionProfile.allowedApps, pkg],
      });
    }
  };

  const removeAllowedApp = (pkg: string) => {
    setDistractionProfile({
      ...distractionProfile,
      allowedApps: distractionProfile.allowedApps.filter((a) => a !== pkg),
    });
  };

  return {
    profile: distractionProfile,
    addDistractionApp,
    removeDistractionApp,
    addAllowedApp,
    removeAllowedApp,
  };
}
