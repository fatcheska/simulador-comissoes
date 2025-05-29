import { useState, useMemo } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, BarChart, Bar
} from "recharts"

function App() {
  const [valorFaturado, setValorFaturado] = useState(30000)
  const [isLancamento, setIsLancamento] = useState(false)
  const [nivel, setNivel] = useState("junior")

  const faixasDados = {
    junior: [
      { limite: 25000, porcentagem: 0.015 },
      { limite: 25000, porcentagem: 0.05 },
      { limite: 40000, porcentagem: 0.07 },
      { limite: 60000, porcentagem: 0.095 },
      { limite: 300000, porcentagem: 0.12 },
    ],
    senior: [
      { limite: 30000, porcentagem: 0.02 },
      { limite: 30000, porcentagem: 0.06 },
      { limite: 50000, porcentagem: 0.08 },
      { limite: 70000, porcentagem: 0.105 },
      { limite: 300000, porcentagem: 0.13 },
    ],
    especialista: [
      { limite: 35000, porcentagem: 0.025 },
      { limite: 35000, porcentagem: 0.07 },
      { limite: 60000, porcentagem: 0.09 },
      { limite: 90000, porcentagem: 0.115 },
      { limite: 300000, porcentagem: 0.14 },
    ],
  }

  const fixos = { junior: 1300, senior: 1550, especialista: 2000 }

  const calcularFaixasComissao = (valor, nivelVendedor) => {
    const nivelAtual = nivelVendedor || nivel
    const faixasOriginais = faixasDados[nivelAtual]
    const faixas = JSON.parse(JSON.stringify(faixasOriginais))

    if (valor >= faixas[0].limite) {
      faixas[0].porcentagem = faixas[1].porcentagem
    }

    let limiteAnterior = 0
    const detalhamento = []
    let faixaContador = 1

    for (let i = 0; i < faixas.length; i++) {
      const { limite, porcentagem } = faixas[i]
      const tetoAtual = Math.min(valor, limite)
      const valorFaixa = Math.max(tetoAtual - limiteAnterior, 0)
      const comissaoFaixa = valorFaixa * porcentagem
      if (valorFaixa > 0) {
        detalhamento.push({
          faixa: faixaContador++,
          de: limiteAnterior,
          ate: limite,
          porcentagem,
          valorFaixa,
          comissaoFaixa
        })
      }
      limiteAnterior = limite
      if (valor <= limite) break
    }

    return detalhamento
  }

  const calcularComissaoNovoModelo = (valor, nivelVendedor) => {
    const detalhamento = calcularFaixasComissao(valor, nivelVendedor)
    const total = detalhamento.reduce((acc, f) => acc + f.comissaoFaixa, 0)
    return fixos[nivelVendedor || nivel] + total
  }

  const calcularComissaoModeloAntigo = (valor) => {
    const percentual = isLancamento ? 0.035 : 0.07
    let bonus = 0
    if (valor >= 20000) bonus += 800
    if (valor >= 40000) bonus += 400
    return valor * percentual + bonus
  }

  const comissaoNovo = calcularComissaoNovoModelo(valorFaturado)
  const comissaoAntigo = calcularComissaoModeloAntigo(valorFaturado)
  const diferenca = comissaoNovo - comissaoAntigo
  const percentualDiferenca = ((diferenca / comissaoAntigo) * 100).toFixed(2)

  const linhaData = useMemo(() => {
    const valores = []
    for (let i = 0; i <= 150000; i += 1000) {
      valores.push({
        name: i,
        Novo: calcularComissaoNovoModelo(i),
        Antigo: calcularComissaoModeloAntigo(i),
      })
    }
    return valores
  }, [nivel, isLancamento])

  const comparativoPorNivelData = useMemo(() => {
    const valores = []
    for (let i = 0; i <= 150000; i += 1000) {
      valores.push({
        name: i,
        Junior: calcularComissaoNovoModelo(i, "junior"),
        Senior: calcularComissaoNovoModelo(i, "senior"),
        Especialista: calcularComissaoNovoModelo(i, "especialista"),
      })
    }
    return valores
  }, [])

  const referencias = faixasDados[nivel].slice(0, -1).map(f => f.limite)
  const legendas = ['Faixa 1', 'Faixa 2', 'Faixa 3', 'Meta', 'Super meta']

  const detalhamentoFaixas = calcularFaixasComissao(valorFaturado)

  const graficoPorNivel = ["junior", "senior", "especialista"].map(n => ({
    name: n.charAt(0).toUpperCase() + n.slice(1),
    valor: calcularComissaoNovoModelo(valorFaturado, n),
  }))

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Simulador de Comissão</h1>

      <label style={{ display: "block", marginBottom: 8 }}>
        Valor Faturado: R${valorFaturado.toLocaleString()}
      </label>
      <input
        type="range"
        min={0}
        max={150000}
        step={1000}
        value={valorFaturado}
        onChange={(e) => setValorFaturado(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 30 }}
      />

      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={isLancamento}
            onChange={(e) => setIsLancamento(e.target.checked)}
          /> Período de lançamento
        </label>
      </div>

      <div style={{ marginBottom: 30 }}>
        <label style={{ marginRight: 10 }}>Nível:</label>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option value="junior">Júnior</option>
          <option value="senior">Sênior</option>
          <option value="especialista">Especialista</option>
        </select>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8, marginBottom: 30 }}>
        <h3 style={{ marginTop: 0 }}>💡 Comparativo</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Modelo</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Modelo Novo</td>
              <td>R${comissaoNovo.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Modelo Antigo</td>
              <td>R${comissaoAntigo.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Diferença</strong></td>
              <td><strong>R${diferenca.toFixed(2)} ({percentualDiferenca}%)</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>💰 Detalhamento por faixa</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 30 }}>
        <thead>
          <tr>
            <th>Faixa</th>
            <th>De</th>
            <th>Até</th>
            <th>%</th>
            <th>Base</th>
            <th>Comissão</th>
          </tr>
        </thead>
        <tbody>
          {detalhamentoFaixas.map((f, i) => (
            <tr key={i}>
              <td>{`Faixa ${f.faixa}`}</td>
              <td>R${f.de.toLocaleString()}</td>
              <td>{f.ate === Infinity ? 'Acima' : `R$${f.ate.toLocaleString()}`}</td>
              <td>{(f.porcentagem * 100).toFixed(2)}%</td>
              <td>R${f.valorFaixa.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td>R${f.comissaoFaixa.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>📊 Comparação entre Modelos e Níveis</h3>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 50 }}>
        <div style={{ flex: 1, minWidth: 300, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Comissão', Novo: comissaoNovo, Antigo: comissaoAntigo }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Novo" fill="#8884d8" />
              <Bar dataKey="Antigo" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 300, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graficoPorNivel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#8884d8" name="Novo Modelo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <h3>📈 Evolução com Faturamento</h3>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 50 }}>
        <div style={{ flex: 1, minWidth: 300, height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={linhaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={(v) => `R$${v / 1000}k`} />
              <YAxis tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip formatter={(v) => `R$${v.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="Novo" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="Antigo" stroke="#82ca9d" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 300, height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparativoPorNivelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={(v) => `R$${v / 1000}k`} />
              <YAxis tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip formatter={(v) => `R$${v.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="Junior" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="Senior" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="Especialista" stroke="#ffc658" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default App