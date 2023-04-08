import { ActivepiecesError, Cursor, ErrorCode, Folder, ProjectId } from '@activepieces/shared'
import { databaseConnection } from '../../database/database-connection'
import { FolderEntity } from './folder.entity'
import { CreateFolderRequest, FolderId, apId } from '@activepieces/shared'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { buildPaginator } from '../../helper/pagination/build-paginator'

export const folderRepo = databaseConnection.getRepository(FolderEntity)

export const flowFolderService = {
    async delete({ projectId, folderId }: { projectId: ProjectId, folderId: FolderId }) {
        await folderRepo.delete({
            id: folderId,
            projectId: projectId,
        })
    },
    async update({ projectId, folderId, request }: { projectId, folderId: FolderId, request: CreateFolderRequest }) : Promise<Folder>{
        const folder = await folderRepo.findOneBy({
            projectId,
            id: folderId,
        })
        if (folder === null || folder === undefined) {
            throw new ActivepiecesError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    message: `Folder ${folderId} is not found`,
                },
            })
        }
        await folderRepo.update(folderId, {
            ...folder,
            displayName: request.displayName,
        })
        return await folderRepo.findOneBy({
            projectId,
            id: folderId,
        })
    },
    async create({ projectId, request }: { projectId, request: CreateFolderRequest }): Promise<Folder> {
        return await folderRepo.save({
            id: apId(),
            projectId: projectId,
            displayName: request.displayName,
        })
    },
    async list({ projectId, cursorRequest, limit }: { projectId: ProjectId, cursorRequest: Cursor | null, limit: number }) {
        const decodedCursor = paginationHelper.decodeCursor(cursorRequest)
        const paginator = buildPaginator({
            entity: FolderEntity,
            query: {
                limit,
                order: 'ASC',
                afterCursor: decodedCursor.nextCursor,
                beforeCursor: decodedCursor.previousCursor,
            },
        })
        const { data, cursor } = await paginator.paginate(folderRepo.createQueryBuilder('folder').where({ projectId }))
        return paginationHelper.createPage<Folder>(data, cursor)
    },
}
