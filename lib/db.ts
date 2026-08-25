import { Pool, types, type PoolClient, type QueryResult, type QueryResultRow } from "pg"

// Preserva o contrato anterior das telas: timestamptz chega como string ISO.
types.setTypeParser(1184, (value) => value)

const globalForDb = globalThis as unknown as { portaMalasPool?: Pool }

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada")
  }

  return new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  })
}

export function getPool(): Pool {
  if (!globalForDb.portaMalasPool) {
    globalForDb.portaMalasPool = createPool()
  }
  return globalForDb.portaMalasPool
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, values)
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await work(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
