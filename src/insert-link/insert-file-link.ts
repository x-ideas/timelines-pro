import type { TFile, Vault } from 'obsidian';
import type { ITimelineEventItemParsed } from '../type';

/** insert file link
 * @deprecated
 */
export async function insertFileLinkIfNeed(
	_currentFile: TFile,
	_vault: Vault,
	_events: ITimelineEventItemParsed[],
) {
	// NOTE: did not insert file link for now
	return;
}
