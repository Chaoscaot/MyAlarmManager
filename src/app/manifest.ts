import type {MetadataRoute} from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "MyAlarm Manager",
        short_name: "MyAlarm",
        description: "A Personal Manager for all alarms",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#0c0a09",
        theme_color: "#0c0a09",

    }
}