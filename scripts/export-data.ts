
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Script para exportar dados das tabelas para arquivos CSV
 * Para usar: npm install papaparse fs
 * Depois: npx ts-node scripts/export-data.ts
 */

// Configuração do cliente Supabase para ambiente Node.js
const SUPABASE_URL = "https://uoovrxfpjsyvpkqdxkoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZyeGZwanN5dnBrcWR4a29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwOTQsImV4cCI6MjA2MTQxNDA5NH0.7x9xrScO6VZdmT2YlwoCXHKS7I1e0CIW58xDIgf0N1w";

// Criar cliente Supabase específico para ambiente Node.js
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storage: undefined,
  },
});

type Table = {
  name: string;
  columns: string[];
};

const tables: Table[] = [
  { name: 'admins', columns: ['id', 'created_at', 'email', 'password'] },
  { name: 'admin_sessions', columns: ['id', 'created_at', 'admin_id', 'token', 'expires_at'] },
  { name: 'configuracao_campanha', columns: ['id', 'created_at', 'updated_at', 'series_numericas'] },
  { 
    name: 'participantes', 
    columns: [
      'id', 'data_cadastro', 'documento', 'nome', 'email', 'telefone', 
      'genero', 'idade', 'id_participante', 'rua', 'numero', 'complemento', 
      'bairro', 'cidade', 'cep', 'uf', 'senha', 'numeros_sorte', 'quantidade_numeros'
    ] 
  },
  { name: 'numeros_sorte', columns: ['id', 'created_at', 'numero', 'documento', 'obs'] },
  { 
    name: 'vendas', 
    columns: [
      'id', 'created_at', 'dataDaVenda', 'documento', 'documentoFiscal', 
      'formaDePagamento', 'imagemCupom', 'itemProcessado', 'loja', 'valorTotal'
    ] 
  },
];

async function exportTableData(tableName: string, columns: string[]): Promise<void> {
  try {
    console.log(`Exportando dados da tabela ${tableName}...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columns.join(','));
    
    if (error) {
      console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log(`Nenhum dado encontrado na tabela ${tableName}`);
      return;
    }
    
    // Converter para formato CSV
    const header = columns.join(',');
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).includes(',') ? `"${value}"` : value;
      }).join(',');
    });
    
    const csvContent = [header, ...rows].join('\n');
    
    // Criar diretório de exportação se não existir
    const exportDir = path.join(process.cwd(), 'data-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    fs.writeFileSync(path.join(exportDir, `${tableName}.csv`), csvContent);
    console.log(`Dados da tabela ${tableName} exportados com sucesso! Total: ${data.length} registros`);
    
  } catch (err) {
    console.error(`Erro ao exportar tabela ${tableName}:`, err);
  }
}

async function exportAllData() {
  console.log('Iniciando exportação de dados...');
  
  for (const table of tables) {
    await exportTableData(table.name, table.columns);
  }
  
  console.log('Exportação concluída!');
}

exportAllData();
