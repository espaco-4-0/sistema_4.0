import { AlertTriangle, CheckCircle2, Package, XCircle } from "lucide-react";

export const inventoryData = [
    {
        id: 1,
        nome: "Arduino Uno R3",
        categoria: "Microcontroladores",
        total: 25,
        disponivel: 15,
        localizacao: "Prateleira A1",
        status: "Disponível",
    },
    {
        id: 2,
        nome: "Raspberry Pi 4",
        categoria: "Computadores",
        total: 10,
        disponivel: 3,
        localizacao: "Prateleira A2",
        status: "Estoque Baixo",
    },
    {
        id: 3,
        nome: "Sensor Ultrassônico HC-SR04",
        categoria: "Sensores",
        total: 50,
        disponivel: 42,
        localizacao: "Gaveta B3",
        status: "Disponível",
    },
    {
        id: 4,
        nome: "Motor DC 12V",
        categoria: "Motores",
        total: 20,
        disponivel: 0,
        localizacao: "Prateleira C1",
        status: "Esgotado",
    },
    {
        id: 5,
        nome: "Placa de Prototipagem",
        categoria: "Componentes",
        total: 30,
        disponivel: 28,
        localizacao: "Gaveta D2",
        status: "Disponível",
    },
];

export const statsEstoque = [
    {
        title: "Total de itens",
        value: inventoryData.length,
        icon: Package,
        color: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        title: "Disponíveis",
        value: inventoryData.filter((i) => i.status === "Disponível").length,
        icon: CheckCircle2,
        color: "bg-green-50",
        iconColor: "text-green-600",
    },
    {
        title: "Estoque Baixo",
        value: inventoryData.filter((i) => i.status === "Estoque Baixo").length,
        icon: AlertTriangle,
        color: "bg-yellow-50",
        iconColor: "text-yellow-600",
    },
    {
        title: "Esgotados",
        value: inventoryData.filter((i) => i.status === "Esgotado").length,
        icon: XCircle,
        color: "bg-red-50",
        iconColor: "text-red-600",
    },
];
