import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import type { ToolDraft } from '../sandbox-models.ts';
import type { WeatherService } from './weather-service.ts';

const TYPES = { string: z.string, number: z.number, boolean: z.boolean };
const INFO = { name: 'mcp-playground', version: '0.4.0' };

export class ToolSession {
    readonly #client = new Client(INFO);
    readonly #draft;
    readonly #handler;

    constructor(draft: ToolDraft, weather: WeatherService) {
        this.#draft = draft;
        this.#handler = createMcpHandler(() => {
            const server = new McpServer(INFO);
            server.registerTool(
                draft.name,
                { description: draft.description, inputSchema: this.#inputSchema() },
                args => weather.lookup(args)
            );
            return server;
        });
    }

    async open() {
        const transport = new StreamableHTTPClientTransport(new URL('http://sandbox.local/mcp'), {
            fetch: (url, init) => this.#handler.fetch(new Request(url, init))
        });
        await this.#client.connect(transport);
        return this;
    }

    async describe() {
        const { tools } = await this.#client.listTools();
        return tools[0];
    }

    async call(args: Record<string, unknown>) {
        const request = { method: 'tools/call' as const, params: { name: this.#draft.name, arguments: args } };
        try {
            return { request, result: await this.#client.callTool(request.params) };
        } catch (error) {
            return { request, error: error instanceof Error ? error.message : String(error) };
        }
    }

    async close() {
        await this.#client.close();
        await this.#handler.close();
    }

    #inputSchema() {
        return z.object(
            Object.fromEntries(
                this.#draft.parameters.map(parameter => {
                    const typed = TYPES[parameter.type]();
                    const described = parameter.description ? typed.describe(parameter.description) : typed;
                    return [parameter.name, parameter.required ? described : described.optional()];
                })
            )
        );
    }
}
