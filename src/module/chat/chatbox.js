/**
 * Helper class to handle the display of chatBox
 */
export default class SFRPGCustomChatMessage {

    static getToken(actor) {
        if (actor.token) {
            return `${actor.token.parent.id}.${actor.token.id}`;
        } else if (canvas.tokens?.controlled[0]?.id) {
            return `${game.scenes.active.id}.${canvas.tokens.controlled[0].id}`;
        } else {
            return "";
        }
    }

    /**
     * Render a custom damage roll.
     * 
     * @param {Roll} roll The roll data
     * @param {object} data The data for the roll
     */
    static async renderDamageRoll(roll, data) {

    }

    /**
     * Render a custom standard roll to chat.
     * 
     * @param {Roll} roll The roll data
     * @param {object} data The data for the roll
     */
    static renderStandardRoll(roll, data) {
        /** Get entities */
        const mainContext = data.rollContext.mainContext ? data.rollContext.allContexts[data.rollContext.mainContext] : null;
        
        let actor = data.rollContext.allContexts['actor'] ? data.rollContext.allContexts['actor'].entity : mainContext?.entity;
        if (!actor) {
            actor = data.rollContext.allContexts['ship'] ? data.rollContext.allContexts['ship'].entity : mainContext?.entity;
            if (!actor) {
                return false;
            }
        }
        
        let item = data.rollContext.allContexts['item'] ? data.rollContext.allContexts['item'].entity : mainContext?.entity;
        if (!item) {
            item = data.rollContext.allContexts['weapon'] ? data.rollContext.allContexts['weapon'].entity : mainContext?.entity;
            if (!item) {
                return false;
            }
        }

        /** Set up variables */
        const hasCapacity = item.hasCapacity();
        const currentCapacity = item.getCurrentCapacity();
        const options = {
            item: item,
            hasDamage: item.hasDamage || false,
            hasSave: item.hasSave || false,
            hasCapacity: hasCapacity,
            ammoLeft: currentCapacity,
            title: data.title ? data.title : 'Roll',
            rawTitle: data.speaker.alias,
            dataRoll: roll,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            config: CONFIG.SFRPG,
            tokenImg: actor.data.token?.img || actor.img,
            actorId: actor.id,
            tokenId: this.getToken(actor),
            breakdown: data.breakdown,
            tags: data.tags
        };

        SFRPGCustomChatMessage._render(roll, data, options);

        return true;
    }

    static async _render(roll, data, options) {
        const templateName = "systems/sfrpg/templates/chat/chat-message-attack-roll.html";
        const rollContent = await roll.render();
        options = foundry.utils.mergeObject(options, { rollContent });
        const cardContent = await renderTemplate(templateName, options);        
        const rollMode = data.rollMode ? data.rollMode : game.settings.get('core', 'rollMode');

        // let explainedRollContent = rollContent;
        // if (options.breakdown) {
        //     const insertIndex = rollContent.indexOf(`<section class="tooltip-part">`);
        //     explainedRollContent = rollContent.substring(0, insertIndex) + options.explanation + rollContent.substring(insertIndex);
        // }

        ChatMessage.create({
            flavor: data.title,
            speaker: data.speaker,
            content: cardContent, //+ explainedRollContent + (options.additionalContent || ""),
            rollMode: rollMode,
            roll: roll,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            sound: CONFIG.sounds.dice
        });
    }
}
