import {
  Users,
  CircleCheckBig,
  CircleX,
  CircleAlert,
  LucideIcon
} from 'lucide-react';

export interface Student {
  id: string;
  name: string;
  class: string;
  status: 'present' | 'absent' | 'late' | 'pending';
  checkInTime?: string;
}

export interface AttendanceTableProps {
  selectedDate: string;
  selectedClass: string;
  searchTerm: string;
}

export interface SummaryCard {
  title: string;
  value: number;
  icon: LucideIcon;
  bgIconColor: string;
  bgColor: string;
}

export const Valores: SummaryCard[] = [
  {
    title: "Total de Estudantes",
    value: 127,
    icon: Users,
    bgIconColor: "text-blue-700",
    bgColor: "bg-blue-100"
  },
  {
    title: "Presentes Hoje",
    value: 98,
    icon: CircleCheckBig,
    bgIconColor: "text-green-700",
    bgColor: "bg-green-100"
  },
  {
    title: "Ausentes Hoje",
    value: 29,
    icon: CircleX,
    bgIconColor: "text-red-700",
    bgColor: "bg-red-100"
  },
  {
    title: "Atrasos Hoje",
    value: 12,
    icon: CircleAlert,
    bgIconColor: "text-yellow-700",
    bgColor: "bg-yellow-100"
  },
];

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Ana Carolina Silva', class: 'robotica', status: 'present', checkInTime: '08:15' },
  { id: '2', name: 'Bruno Henrique Santos', class: 'programacao', status: 'present', checkInTime: '08:10' },
  { id: '3', name: 'Carla Mendes Oliveira', class: 'robotica', status: 'late', checkInTime: '08:45' },
  { id: '4', name: 'Daniel Ferreira Costa', class: 'automacao', status: 'absent' },
  { id: '5', name: 'Elena Rodrigues Lima', class: 'iot', status: 'present', checkInTime: '08:05' },
  { id: '6', name: 'Fernando Alves Pereira', class: 'programacao', status: 'present', checkInTime: '08:20' },
  { id: '7', name: 'Gabriela Souza Martins', class: 'robotica', status: 'pending' },
  { id: '8', name: 'Henrique Castro Nunes', class: 'automacao', status: 'present', checkInTime: '08:12' },
  { id: '9', name: 'Isabella Rocha Barbosa', class: 'iot', status: 'late', checkInTime: '08:50' },
  { id: '10', name: 'João Pedro Araújo', class: 'programacao', status: 'present', checkInTime: '08:08' },
  { id: '11', name: 'Larissa Fernandes Dias', class: 'robotica', status: 'absent' },
  { id: '12', name: 'Mateus Gomes Cardoso', class: 'automacao', status: 'present', checkInTime: '08:18' },
  { id: '13', name: 'Natália Ribeiro Cruz', class: 'iot', status: 'pending' },
  { id: '14', name: 'Pedro Lucas Monteiro', class: 'programacao', status: 'present', checkInTime: '08:25' },
  { id: '15', name: 'Rafaela Torres Moreira', class: 'robotica', status: 'late', checkInTime: '08:40' },
  { id: '16', name: 'Sofia Almeida Costa', class: 'automacao', status: 'present', checkInTime: '08:22' },
  { id: '17', name: 'Thiago Vieira Lima', class: 'iot', status: 'present', checkInTime: '08:30' },
  { id: '18', name: 'Valentina Santos Souza', class: 'programacao', status: 'absent' },
  { id: '19', name: 'William Oliveira Rocha', class: 'robotica', status: 'present', checkInTime: '08:14' },
  { id: '20', name: 'Yasmin Costa Ferreira', class: 'automacao', status: 'late', checkInTime: '08:55' },
  { id: '21', name: 'Arthur Mendes Silva', class: 'iot', status: 'present', checkInTime: '08:06' },
  { id: '22', name: 'Beatriz Lima Pereira', class: 'programacao', status: 'pending' },
  { id: '23', name: 'Caio Rodrigues Martins', class: 'robotica', status: 'present', checkInTime: '08:19' },
  { id: '24', name: 'Daniela Nunes Barbosa', class: 'automacao', status: 'present', checkInTime: '08:11' },
  { id: '25', name: 'Eduardo Araújo Castro', class: 'iot', status: 'absent' },
];

