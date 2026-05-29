import { useEffect, useState } from "react";
import { fmtNum } from "../utils/format";
import Table from "../common/Table";
import JornalNoProductivo from "../model/JornalNoProductivo";
import { jornalNoProductivoService } from "../services/JornalNoProductivoService";
import { useFarm } from "../context/FarmContext";
import ErrorBanner from "../common/ErrorBanner";
import TableShimmer from "./TableShimmer";
import TableTitle from "../common/TableTitle";
import { employeeService } from "../services/employeeService";
import { useLoadingError } from "../hooks/useLoadingError";
import { Employee } from "../model/Employee";
import JornalNoProdModal from "./JornalNoProdModal";
import { Clock } from "lucide-react";
import { DeleteIcon, EditIcon } from "../common/IconButtons";
import ToastProps, { successToast } from "../model/ToastProps";
import Toast from "./Toast";

const formatTemporada = (anio: number) => `${anio} - ${anio + 1}`;

const formatFecha = (fecha: string) => {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
};

const JornalesNoProductivos = () => {
    const { activeFarm } = useFarm();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jornales, setJornales] = useState<JornalNoProductivo[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { error, loading, setLoading, wrap } = useLoadingError();
    const [selectedJornal, setSelectedJornal] = useState<JornalNoProductivo | null>(null);
    const [toast, setToast] = useState<ToastProps | null>(null);

    useEffect(() => {
        if (activeFarm) {
            fetchEmployees();
            setSelectedYear(null);
            setAvailableYears([]);
            setLoading(true);
            jornalNoProductivoService.getAniosDisponibles(activeFarm.id).then((years: number[]) => {
                setAvailableYears(years);
                if (years.length > 0) {
                    setSelectedYear(years[0]);
                } else {
                    setLoading(false);
                }
            }).catch(() => {
                setAvailableYears([]);
                setLoading(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFarm]);

    useEffect(() => {
        if (activeFarm && selectedYear !== null) {
            fetchJornales();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFarm, selectedYear]);

    const fetchJornales = wrap(async () => {
        const result = await jornalNoProductivoService.listByYear(activeFarm?.id ?? 0, selectedYear);
        setJornales(result);
    }, 'Error al cargar jornales');

    const fetchEmployees = wrap(async () => {
        const result = await employeeService.getAll(activeFarm?.id ?? 0);
        setEmployees(result);
    }, 'Error al cargar los empleados');

    const onSubmit = (workday: JornalNoProductivo) => {
        console.log(workday)
        const call = wrap(async () => {
            const result = workday.id ? await jornalNoProductivoService.update(workday) : await jornalNoProductivoService.create(workday);
            if (workday.id) {
                setJornales(jornales.map(v => v.id === workday.id ? result : v))
            } else {
                setJornales([...jornales, result])
            }
            setToast(successToast('Registro guardado correctamente'));
            setIsModalOpen(false);
        }, 'Error al guardar el jornal');
        call();
    }

    const onAddWorkday = () => {
        setSelectedJornal(null);
        setIsModalOpen(true);
    }

    const handleClose = () => {
        setIsModalOpen(false);
    }

    const onEdit = (jornal: JornalNoProductivo) => {
        setSelectedJornal(jornal);
        setIsModalOpen(true);
    }

    const onDelete = (jornal: JornalNoProductivo) => {
        if (confirm('Esta seguro de querer eliminar este jornal?')) {
            wrap(async () => {
                await jornalNoProductivoService.delete(jornal.id);
                setJornales(jornales.filter(j => j.id !== jornal.id))
            }, 'Error al eliminar el jornal')();
        }
    }

    const renderTableContent = (entity: JornalNoProductivo) => {
        return [
            <div>{formatFecha(entity.fecha)}</div>,
            <div className="text-center">{entity.nombreEmpleado}</div>,
            <div className="justify-center text-center">
                <span className="inline-flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {fmtNum(entity.jornales)}
                </span>
            </div>,
            <div className="flex space-x-3 justify-end">
                <EditIcon onClick={() => onEdit(entity)} label="Editar" />
                <DeleteIcon onClick={() => onDelete(entity)} label="Eliminar" />
            </div>
        ];
    }


    return (<div className="p-6">
        {toast && (
            <Toast
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(null)}
            />
        )}
        <TableTitle handleBack={() => { }} onAddWorkday={onAddWorkday} title="Jornales no productivos" />
        <div className="flex items-center justify-between mb-4">
            {selectedYear !== null
                ? <p className="text-sm text-gray-500">Total del período: <span className="font-semibold text-gray-700">{fmtNum(jornales.reduce((sum, j) => sum + j.jornales, 0))} jornales</span></p>
                : <span />
            }
            <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2" htmlFor="np-year">Temporada</label>
                <select
                    id="np-year"
                    className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
                    value={selectedYear ?? ''}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    disabled={availableYears.length === 0}
                >
                    {availableYears.length === 0 && (
                        <option value="">Sin periodos disponibles</option>
                    )}
                    {availableYears.map((year) => (
                        <option key={year} value={year}>{formatTemporada(year)}</option>
                    ))}
                </select>
            </div>
        </div>
        {error != null && error.length > 0 && <ErrorBanner error={error} retry={fetchJornales} />}
        {loading
            ? <TableShimmer columns={[20, 30, 15, 20, 15]} rows={4} />
            : <Table
                header={['Fecha', 'Nombre del empleado', 'Jornales', 'Acciones']}
                emptyMessage={() => 'No hay jornales registrados en esta seccion.'}
                data={jornales}
                content={renderTableContent} />
        }
        {isModalOpen && <JornalNoProdModal
            employees={employees}
            jornal={selectedJornal}
            handleClose={handleClose}
            onSubmit={onSubmit}
        />}
    </div>)
}

export default JornalesNoProductivos;