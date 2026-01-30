// Party Lions - Spreadsheet Import (CSV, XLSX, XLS, TSV)

import * as XLSX from 'xlsx';
import type { ImportResult } from '../types';

/**
 * Import teams from a spreadsheet file
 * Supports: .csv, .xlsx, .xls, .tsv
 */
export async function importSpreadsheet(file: File): Promise<ImportResult> {
    const errors: string[] = [];
    const teams: ImportResult['teams'] = [];

    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return { success: false, teams: [], errors: ['No sheets found in file'] };
        }

        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON array
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

        if (data.length < 2) {
            return { success: false, teams: [], errors: ['File must have header row and at least one team'] };
        }

        // Detect header row
        const headers = (data[0] || []).map(h => h?.toString().toLowerCase().trim() || '');

        // Find column indices
        const teamNameCol = findColumnIndex(headers, ['team', 'name', 'team name', 'teamname']);
        const player1Col = findColumnIndex(headers, ['player 1', 'player1', 'member 1', 'member1', 'player one']);
        const player2Col = findColumnIndex(headers, ['player 2', 'player2', 'member 2', 'member2', 'player two']);

        if (teamNameCol === -1) {
            // Try using first column as team name
            if (headers.length > 0) {
                errors.push('Could not find team name column header. Using first column.');
            } else {
                return { success: false, teams: [], errors: ['Could not find team name column'] };
            }
        }

        const nameColIndex = teamNameCol >= 0 ? teamNameCol : 0;

        // Parse rows (skip header)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const teamName = row[nameColIndex]?.toString().trim();

            if (!teamName) {
                errors.push(`Row ${i + 1}: Empty team name, skipping`);
                continue;
            }

            // Check for duplicate names
            if (teams.some(t => t.name.toLowerCase() === teamName.toLowerCase())) {
                errors.push(`Row ${i + 1}: Duplicate team name "${teamName}", skipping`);
                continue;
            }

            teams.push({
                name: teamName,
                player1: player1Col >= 0 ? row[player1Col]?.toString().trim() : undefined,
                player2: player2Col >= 0 ? row[player2Col]?.toString().trim() : undefined,
            });
        }

        if (teams.length === 0) {
            return { success: false, teams: [], errors: ['No valid teams found in file'] };
        }

        return { success: true, teams, errors };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, teams: [], errors: [`Failed to parse file: ${message}`] };
    }
}

/**
 * Find column index by checking multiple possible header names
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h.includes(name));
        if (index >= 0) return index;
    }
    return -1;
}

/**
 * Parse comma-separated team names (quick add mode)
 */
export function parseQuickAdd(input: string): string[] {
    return input
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
}

/**
 * Get accepted file types for import
 */
export function getAcceptedFileTypes(): string {
    return '.csv,.xlsx,.xls,.tsv';
}

/**
 * Validate file type
 */
export function isValidFileType(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['csv', 'xlsx', 'xls', 'tsv'].includes(extension || '');
}
