import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateSlackWorkspaceDto {
    @ApiProperty({
        description: 'Workspace active status',
        example: false,
        required: false
    })
    @IsBoolean()
    isActive: boolean;
}