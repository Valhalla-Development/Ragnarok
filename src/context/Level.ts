import { Client, ContextMenu, Discord } from 'discordx';
import {
    ApplicationCommandType, AttachmentBuilder, GuildMember, UserContextMenuCommandInteraction,
} from 'discord.js';
import { createCanvas, Image, loadImage } from 'canvas';
// @ts-expect-error no type file available for this package
import abbreviate from 'number-abbreviate';
// @ts-expect-error no type file available for this package
import converter from 'number-to-words-en';
import path from 'path';
import { readFileSync } from 'fs';
import { color, RagnarokEmbed } from '../utils/Util.js';
import Level from '../mongo/Level.js';

@Discord()
export class LevelContext {
    /**
     * View users level
     * @param interaction - The command interaction
     * @param client - The Discord client.
     */
    @ContextMenu({
        name: 'Level',
        type: ApplicationCommandType.User,
    })
    async levelContext(interaction: UserContextMenuCommandInteraction, client: Client): Promise<void> {
        const member = interaction.targetMember as GuildMember;
        await member.fetch();

        await interaction.deferReply();

        if (member.user.bot) {
            await RagnarokEmbed(client, interaction, 'Error', 'Member does not have a level.', true);
            return;
        }

        const score = await Level.findOne({ IdJoined: `${member.id}-${interaction.guild!.id}` });
        if (!score) {
            await RagnarokEmbed(client, interaction, 'Error', 'Member does not have a level.', true);
            return;
        }

        const { Level: level, Xp: xp, Country } = score;

        const levelNoMinus = level + 1;
        const currentLvl = level;
        const nxtLvlXp = (5 / 6) * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91);
        const currentxpLvl = (5 / 6) * currentLvl * (2 * currentLvl * currentLvl + 27 * currentLvl + 91);
        const toLevel = Math.floor(nxtLvlXp - currentxpLvl);
        const inLevel = Math.floor(xp - currentxpLvl);
        const xpLevel = `${abbreviate(inLevel, 2)}/${abbreviate(toLevel, 2)} XP`;
        const xpPercent = (inLevel / toLevel) * 100;

        const getRank = await Level.find({ GuildId: interaction.guild!.id }).sort({ Xp: -1 });
        const filterRank = getRank.find((b) => b.IdJoined === `${interaction.user.id}-${interaction.guild!.id}`);
        const rankPos = converter.toOrdinal(getRank.indexOf(filterRank!) + 1);

        const canvas = createCanvas(934, 282);
        const ctx = canvas.getContext('2d');

        let userStatusColor: string | null = '#737F8D';

        const fetchUser = await interaction.guild!.members.fetch(member.id);
        if (fetchUser.presence) {
            switch (fetchUser.presence.status) {
            case 'online':
                userStatusColor = '#43B581';
                break;
            case 'idle':
                userStatusColor = '#FAA61A';
                break;
            case 'dnd':
                userStatusColor = '#F04747';
                break;
            default:
                userStatusColor = null;
                break;
            }
        }

        const image = readFileSync(path.join(process.cwd(), 'assets/canvas/images/Level.png'));

        const background = await loadImage(image);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, 934, 282);

        function roundRect(x: number, y: number, w: number, h: number, radius: number) {
            ctx.save();
            const r = x + w;
            const b = y + h;
            ctx.beginPath();
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.75;
            ctx.moveTo(x + radius, y);
            ctx.lineTo(r - radius, y);
            ctx.quadraticCurveTo(r, y, r, y + radius);
            ctx.lineTo(r, y + h - radius);
            ctx.quadraticCurveTo(r, b, r - radius, b);
            ctx.lineTo(x + radius, b);
            ctx.quadraticCurveTo(x, b, x, b - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }

        roundRect(511.5, 48.6, 376, 59, 10);
        roundRect(259.8, 133, 628.4, 42, 10);
        roundRect(259.8, 182.62, 628.4, 36.5, 20);

        // Levels / Ranks
        const levelNumber = level.toString();
        const levelText = 'LEVEL';
        const rankNumber = `#${rankPos}`;
        const rankText = 'RANK';
        const usergrab = member.user.displayName;
        const discrim = member.user.discriminator !== '0' ? `#${member.user.discriminator}` : null;
        const avatarGrab = member.user.displayAvatarURL({ extension: 'png' });

        class ProgressBar {
            dim: { x: number, y: number, width: number, height: number };

            color: string;

            percentage: number;

            constructor(dimension: { x: number, y: number, width: number, height: number, }, colorC: string, percentage: number) {
                this.dim = dimension;
                this.color = colorC;
                this.percentage = percentage / 100;
            }

            draw() {
                const p = this.percentage * this.dim.width;
                ctx.fillStyle = this.color;

                if (p <= this.dim.height) {
                    // draw left arc
                    ctx.beginPath();
                    ctx.arc(
                        this.dim.height / 2 + this.dim.x,
                        this.dim.height / 2 + this.dim.y,
                        this.dim.height / 2,
                        Math.PI - Math.acos((this.dim.height - p) / this.dim.height),
                        Math.PI + Math.acos((this.dim.height - p) / this.dim.height),
                    );
                    ctx.save();

                    // draw right arc
                    ctx.scale(-1, 1);
                    ctx.arc(
                        this.dim.height / 2 - p - this.dim.x,
                        this.dim.height / 2 + this.dim.y,
                        this.dim.height / 2,
                        Math.PI - Math.acos((this.dim.height - p) / this.dim.height),
                        Math.PI + Math.acos((this.dim.height - p) / this.dim.height),
                    );
                    ctx.restore();
                    ctx.closePath();
                } else {
                    // draw left arc
                    ctx.beginPath();
                    ctx.arc(this.dim.height / 2 + this.dim.x, this.dim.height / 2 + this.dim.y, this.dim.height / 2, Math.PI / 2, (3 / 2) * Math.PI);

                    // draw rectangle
                    ctx.lineTo(p - this.dim.height + this.dim.x, this.dim.y);

                    // draw right arc
                    ctx.arc(
                        p - this.dim.height / 2 + this.dim.x,
                        this.dim.height / 2 + this.dim.y,
                        this.dim.height / 2,
                        (3 / 2) * Math.PI,
                        Math.PI / 2,
                    );

                    // close path
                    ctx.lineTo(this.dim.height / 2 + this.dim.x, this.dim.height + this.dim.y);
                    ctx.closePath();
                }

                ctx.fill();
            }
        }

        const progressbar = new ProgressBar(
            {
                x: 259.8,
                y: 182.62,
                width: 628.4,
                height: 36.5,
            },
            color(member.displayHexColor).toString(),
            xpPercent,
        );
        progressbar.draw();

        // Draw XP
        function drawXP(x: number, y: number, xpa: string) {
            ctx.font = '22px Shapirit';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'right';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.25;
            ctx.fillText(xpa, x, y);
            ctx.strokeText(xpa, x, y);
            ctx.save();
        }

        drawXP(880, 165.4, xpLevel);

        function drawEmote(x: number, y: number, img: Image) {
            ctx.drawImage(img, x, y, 50, 50);
        }

        if (score && Country) {
            try {
                const img = await loadImage(Country);
                // Draw Contry Emoji
                drawEmote(450, 54.3, img);
            } catch {
                // do nothing
            }
        }

        // Draw Percentage
        function drawPercent(x: number, y: number, input: string) {
            ctx.font = '34px Shapirit';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 0.5;
            ctx.fillText(input, x, y);
            ctx.strokeText(input, x, y);
        }

        drawPercent(570, 212, `${xpPercent.toFixed(1)}%`);

        // Draw level
        function drawLevel(x: number, y: number, txt: string, num: string, style: string) {
            ctx.font = '48px Shapirit';
            ctx.fillStyle = style;
            ctx.textAlign = 'right';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;
            ctx.fillText(num, x, y);
            ctx.strokeText(num, x, y);
            const w = ctx.measureText(num).width;

            ctx.font = '22px Shapirit';
            ctx.fillStyle = style;
            ctx.textAlign = 'right';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.25;
            ctx.fillText(txt, x - w - 4, y);
            ctx.strokeText(txt, x - w - 4, y);
            ctx.save();
        }

        drawLevel(880, 96.8, levelText, levelNumber, '#FF1700');

        // Draw rank
        ctx.font = '22px Shapirit';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.25;
        ctx.fillText(rankText, 522.5, 96.8);
        ctx.strokeText(rankText, 522.5, 96.8);

        ctx.font = '48px Shapirit';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5;
        ctx.fillText(rankNumber, 522.5 + 64.5, 96.8);
        ctx.strokeText(rankNumber, 522.5 + 64.5, 96.8);
        ctx.save();

        // Draw Username
        function drawUsername(x: number, y: number, max: number, use: string, dis: string | null) {
            let modifiedUse = use;
            ctx.font = '34px Shapirit';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;
            while (ctx.measureText(modifiedUse).width > max) {
                modifiedUse = modifiedUse.substring(0, modifiedUse.length - 1);
            }
            ctx.fillText(modifiedUse, x, y);
            ctx.strokeText(modifiedUse, x, y);

            if (dis) {
                const w = ctx.measureText(modifiedUse).width;

                ctx.font = '22px Shapirit';
                ctx.fillStyle = '#7F8384';
                ctx.textAlign = 'left';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 0.25;
                ctx.fillText(dis, x + w + 4, y);
                ctx.strokeText(dis, x + w + 4, y);
                ctx.save();
            }
        }

        drawUsername(270, 165.4, 364, usergrab, discrim);

        // circle around avatar
        ctx.beginPath();
        ctx.arc(122.5, 141.8, 81, 0, Math.PI * 2, true);
        ctx.strokeStyle = color(member.displayHexColor).toString();
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.save();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(avatarGrab);
        ctx.strokeStyle = color(member.displayHexColor).toString();
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar, 41.5, 60.5, 162, 162);

        // presence circle
        ctx.restore();
        ctx.beginPath();
        ctx.arc(184.5, 193.5, 19, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.fillStyle = userStatusColor!;
        ctx.fill();
        ctx.save();

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'level.jpg' });
        interaction.editReply({ files: [attachment] })
            .catch((err) => console.error(err));
    }
}
