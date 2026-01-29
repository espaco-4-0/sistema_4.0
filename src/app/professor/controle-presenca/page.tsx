"use client";

import { useState } from "react";
import { AttendanceTable } from "@/src/ui/modules/professor_pages/controle-de-presenca";

export default function ControlePresencaPage() {
    const [date, setDate] = useState("");
    const [classId, setClassId] = useState("");
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <AttendanceTable selectedDate={date} selectedClass={classId} searchTerm={search} />
        </div>
    );
}
