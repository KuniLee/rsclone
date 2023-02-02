import { ParsedQuery } from 'query-string'

export type URLParams = {
    path: string[]
    search: ParsedQuery<string>
}
