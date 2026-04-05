"use client";

import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";

const fmt = (n) => {
  if (!isFinite(n)) return "$ 0,00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const num = (v) => {
  const cleaned = String(v).replace(",", ".").replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

function Field({ label, value, onChange, placeholder = "0" }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "13px 14px",
          borderRadius: 14,
          border: "1px solid #cbd5e1",
          fontSize: 16,
          background: "#f8fafc",
          color: "#0f172a",
          outline: "none",
          boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.04)",
        }}
      />
    </div>
  );
}

function Row({ label, value, highlight = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        border: highlight ? "1px solid #93c5fd" : "1px solid #dbe4f0",
        borderRadius: 16,
        background: highlight ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : "#ffffff",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
      }}
    >
      <span style={{ color: "#475569", fontWeight: 600 }}>{label}</span>
      <strong style={{ color: "#0f172a", fontSize: 18 }}>{value}</strong>
    </div>
  );
}

export default function Page() {
  const [precioKgFilamento, setPrecioKgFilamento] = useState("19000");
  const [precioKwh, setPrecioKwh] = useState("140");
  const [consumoW, setConsumoW] = useState("120");
  const [precioRepuestos, setPrecioRepuestos] = useState("150000");
  const [horasVidaRepuesto, setHorasVidaRepuesto] = useState("2880");
  const [porcentajeError, setPorcentajeError] = useState("8");
  const [gastosFijos, setGastosFijos] = useState("0");

  const [horas, setHoras] = useState("19");
  const [minutos, setMinutos] = useState("20");
  const [gramosFilamento, setGramosFilamento] = useState("465");
  const [insumos, setInsumos] = useState("0");
  const [multiplicadorGanancia, setMultiplicadorGanancia] = useState("4");

  const [nombreNegocio, setNombreNegocio] = useState("Juanjo 3D");
  const [nombreCliente, setNombreCliente] = useState("");
  const [descripcionTrabajo, setDescripcionTrabajo] = useState("Impresión 3D");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [validezPresupuesto, setValidezPresupuesto] = useState("7");
  const [observaciones, setObservaciones] = useState(
    "Seña del 50% para comenzar. Los tiempos pueden variar según demanda y complejidad."
  );

  const valores = useMemo(() => {
    const kg = num(precioKgFilamento);
    const kwh = num(precioKwh);
    const watts = num(consumoW);
    const repuestos = num(precioRepuestos);
    const horasVida = num(horasVidaRepuesto);
    const error = num(porcentajeError) / 100;
    const fijos = num(gastosFijos);

    const h = num(horas);
    const m = num(minutos);
    const hsTotales = h + m / 60;
    const gramos = num(gramosFilamento);
    const extras = num(insumos);
    const mult = num(multiplicadorGanancia);

    const precioMaterial = (kg / 1000) * gramos;
    const precioLuz = (watts / 1000) * hsTotales * kwh;
    const desgastePorHoraCalculado = horasVida > 0 ? repuestos / horasVida : 0;
    const desgasteImpresora = desgastePorHoraCalculado * hsTotales;

    const subtotalBase = precioMaterial + precioLuz + desgasteImpresora + fijos;
    const margenError = subtotalBase * error;
    const costoTotalIncluyendoInsumos = subtotalBase + margenError + extras;
    const costoTotalCobrar = costoTotalIncluyendoInsumos * mult;
    const mercadoLibre = costoTotalCobrar * 1.8;

    return {
      hsTotales,
      precioMaterial,
      precioLuz,
      desgastePorHoraCalculado,
      desgasteImpresora,
      margenError,
      costoTotalIncluyendoInsumos,
      costoTotalCobrar,
      mercadoLibre,
    };
  }, [
    precioKgFilamento,
    precioKwh,
    consumoW,
    precioRepuestos,
    horasVidaRepuesto,
    porcentajeError,
    gastosFijos,
    horas,
    minutos,
    gramosFilamento,
    insumos,
    multiplicadorGanancia,
  ]);

  const descargarPDF = () => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const fecha = new Date().toLocaleDateString("es-AR");

    const clienteFinal = nombreCliente || "Consumidor final";
    const trabajoFinal = descripcionTrabajo || "Impresión 3D";

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 210, 35, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(nombreNegocio || "Juanjo 3D", 14, 15);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Presupuesto", 14, 24);
    pdf.text(`Fecha: ${fecha}`, 14, 30);

    pdf.setTextColor(0, 0, 0);

    let y = 50;

    pdf.setFont("helvetica", "bold");
    pdf.text("Cliente:", 14, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(clienteFinal, 40, y);

    y += 12;

    pdf.setFont("helvetica", "bold");
    pdf.text("Trabajo:", 14, y);

    pdf.setFont("helvetica", "normal");
    const trabajoLines = pdf.splitTextToSize(trabajoFinal, 160);
    pdf.text(trabajoLines, 14, y + 8);

    y += 25;

    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(14, y, 182, 25, 4, 4, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Precio total", 18, y + 10);

    pdf.setFontSize(18);
    pdf.text(fmt(valores.costoTotalCobrar), 18, y + 20);

    y += 40;

    pdf.setFontSize(11);

    pdf.setFont("helvetica", "bold");
    pdf.text("Tiempo estimado:", 14, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${num(horas)} hs ${num(minutos)} min`, 70, y);

    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Material:", 14, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${num(gramosFilamento)} g`, 70, y);

    y += 15;

    pdf.setFont("helvetica", "bold");
    pdf.text("Observaciones:", 14, y);

    pdf.setFont("helvetica", "normal");
    const obs = pdf.splitTextToSize(
      observaciones || "Seña del 50% para comenzar.",
      180
    );
    pdf.text(obs, 14, y + 8);

    pdf.setFontSize(10);
    pdf.setTextColor(100);

    pdf.text(`Validez: ${validezPresupuesto || "7"} días`, 14, 285);

    if (whatsapp) pdf.text(`WhatsApp: ${whatsapp}`, 80, 285);
    if (instagram) pdf.text(`Instagram: ${instagram}`, 140, 285);

    pdf.save(`presupuesto-${clienteFinal.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 24 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
            color: "#ffffff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 20px 50px rgba(29, 78, 216, 0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.1 }}>
                Calculadora Juanjo · Impresiones 3D
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", marginTop: 10, fontSize: 17 }}>
                Calculá material, luz, desgaste, margen de error y precio final de forma clara y profesional.
              </p>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 18,
                padding: "14px 18px",
                minWidth: 220,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Margen activo</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>× {multiplicadorGanancia}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 1fr", gap: 20 }}>
          <section style={cardStyle}>
            <h2 style={sectionTitle}>Gastos fijos</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Precio kg filamento" value={precioKgFilamento} onChange={setPrecioKgFilamento} />
              <Field label="Precio kWh" value={precioKwh} onChange={setPrecioKwh} />
              <Field label="Consumo real por hora (W)" value={consumoW} onChange={setConsumoW} />
              <Field label="Precio repuestos" value={precioRepuestos} onChange={setPrecioRepuestos} />
              <Field
                label="Horas de uso hasta cambiar repuesto"
                value={horasVidaRepuesto}
                onChange={setHorasVidaRepuesto}
              />
              <Field label="Porcentaje de error" value={porcentajeError} onChange={setPorcentajeError} />
              <Field label="Otros gastos fijos prorrateados" value={gastosFijos} onChange={setGastosFijos} />
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitle}>Pieza y cliente</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <Field
                label="Nombre del negocio"
                value={nombreNegocio}
                onChange={setNombreNegocio}
                placeholder="Ej: Juanjo 3D"
              />
              <Field
                label="Nombre del cliente"
                value={nombreCliente}
                onChange={setNombreCliente}
                placeholder="Ej: Juan Pérez"
              />
              <Field
                label="Descripción del trabajo"
                value={descripcionTrabajo}
                onChange={setDescripcionTrabajo}
                placeholder="Ej: Maceta hexagonal"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field
                  label="WhatsApp"
                  value={whatsapp}
                  onChange={setWhatsapp}
                  placeholder="Ej: 11 1234-5678"
                />
                <Field
                  label="Instagram"
                  value={instagram}
                  onChange={setInstagram}
                  placeholder="Ej: @juanjo3d"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Horas" value={horas} onChange={setHoras} />
                <Field label="Minutos" value={minutos} onChange={setMinutos} />
              </div>
              <Field label="Gramos de filamento" value={gramosFilamento} onChange={setGramosFilamento} />
              <Field label="Insumos" value={insumos} onChange={setInsumos} />
              <Field
                label="Margen de ganancia"
                value={multiplicadorGanancia}
                onChange={setMultiplicadorGanancia}
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <button
                  onClick={() => setMultiplicadorGanancia("4")}
                  style={multiplicadorGanancia === "4" ? activeBtn : btn}
                >
                  Minorista
                </button>
                <button
                  onClick={() => setMultiplicadorGanancia("3")}
                  style={multiplicadorGanancia === "3" ? activeBtn : btn}
                >
                  Mayorista
                </button>
                <button
                  onClick={() => setMultiplicadorGanancia("5")}
                  style={multiplicadorGanancia === "5" ? activeBtn : btn}
                >
                  Llaveros
                </button>
              </div>
              <Field
                label="Validez del presupuesto (días)"
                value={validezPresupuesto}
                onChange={setValidezPresupuesto}
                placeholder="7"
              />
              <Field
                label="Observaciones"
                value={observaciones}
                onChange={setObservaciones}
                placeholder="Condiciones del trabajo"
              />
            </div>
          </section>

          <section style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
            <h2 style={sectionTitle}>Resultado final</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <Row label="Tiempo total" value={`${valores.hsTotales.toFixed(2)} hs`} />
              <Row label="Precio material" value={fmt(valores.precioMaterial)} />
              <Row label="Precio luz" value={fmt(valores.precioLuz)} />
              <Row label="Desgaste por hora calculado" value={fmt(valores.desgastePorHoraCalculado)} />
              <Row label="Desgaste impresora" value={fmt(valores.desgasteImpresora)} />
              <Row label="Margen de error" value={fmt(valores.margenError)} />
              <Row label="Insumos" value={fmt(num(insumos))} />
              <Row label="Costo total incluyendo insumos" value={fmt(valores.costoTotalIncluyendoInsumos)} highlight />
              <Row label="Costo total a cobrar" value={fmt(valores.costoTotalCobrar)} highlight />
              <Row label="Opción Mercado Libre" value={fmt(valores.mercadoLibre)} highlight />
            </div>
            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <button onClick={descargarPDF} style={downloadBtn}>
                Descargar presupuesto PDF
              </button>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                El PDF muestra solo la información importante para el cliente.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.96)",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #dbe4f0",
  boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
  backdropFilter: "blur(8px)",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 18,
  fontSize: 24,
  color: "#0f172a",
};

const btn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#1e293b",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
  boxShadow: "0 6px 14px rgba(15, 23, 42, 0.04)",
};

const activeBtn = {
  ...btn,
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "#ffffff",
  border: "1px solid #1d4ed8",
  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.28)",
};

const downloadBtn = {
  padding: "14px 16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 16,
  boxShadow: "0 12px 24px rgba(22, 163, 74, 0.28)",
};