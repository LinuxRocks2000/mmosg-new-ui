const DEBUG = false;
const BARE = false;
const INTERPOLATE = true;
const passive = ["w", "T", "m", "S", "G", "g"]; // types that can be legally placed near forts

function clamp(min, val, max) {
    if (val < min) {
        val = min;
    }
    if (val > max) {
        val = max;
    }
    return val;
}

function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function coterminal(thing, about = Math.PI * 2) {
    while (thing > about) {
        thing -= about;
    }
    while (thing < 0) {
        thing += about;
    }
    return thing;
}

function ringDist(p1, p2, circumference = Math.PI * 2) {
    p1 = coterminal(p1, circumference);
    p2 = coterminal(p2, circumference);
    var dist = p2 - p1;
    if (Math.abs(dist) > circumference/2) {
        dist = (circumference - Math.abs(dist)) * (dist < 0 ? 1 : -1);
    }
    return dist;
}

function randomizeBanner() {
    var banner = document.getElementById("banner");
    if (banner.value == "") {
        function rando(list) {
            return list[Math.floor(Math.random() * list.length)];
        }
        var spacer = rando([" ", "_", "-", ".", "+"]);
        var adjectives = ["Proud", "Angry", "Small", "Floral", "Wet", "Green", "Brown", "Black", "Strong", "Weak", "Limping", "Hungry"];
        var animals = ["Bear", "Wolf", "Rabbit", "Deer", "Squirrel", "Eagle", "Sparrow", "Mouse", "Hawk"];
        var junctions = ["Makes", "of", "Walks" + spacer + "in", "Eats" + spacer + "the", "Runs" + spacer + "in", "Flies" + spacer + "in", "Binge" + spacer + "Watches"];
        var elements = ["Wind", "Water", "Fire", "Dirt", "Clay", "Trees", "Costco"];
        var name = rando(adjectives) + spacer + rando(animals) + spacer + rando(junctions) + spacer + rando(elements) + spacer + Math.round(Math.random() * 10000);
        banner.value = name;
    }
}

function todo(thing) {
    throw "TODO: " + thing;
}


function notify(notification) {
    if (!document.hasFocus()) {
        const notif = new Notification("MMOSG", {
            body: notification
        });
    }
}


class ProtocolMessageReceivedEvent extends Event {
    constructor(command, args, initDict = undefined) {
        super("protocolmessagereceived", initDict);
        this.command = command;
        this.args = args;
    }
}


class Sidebar {
    constructor() {
        this.path = new Path2D();
        this.path.moveTo(60, 56);
        this.path.quadraticCurveTo(36, 56, 36, 80);
        this.path.lineTo(36, 262);
        this.path.quadraticCurveTo(36, 286, 60, 286);
        this.path.lineTo(242, 286);
        this.path.quadraticCurveTo(266, 286, 266, 310);
        this.path.lineTo(266, 856);
        this.path.quadraticCurveTo(266, 872, 250, 880);
        this.path.lineTo(152, 928);
        this.path.quadraticCurveTo(136, 936, 136, 952);
        this.path.lineTo(136, 1120);
        this.path.quadraticCurveTo(136, 1144, 160, 1144);
        this.path.lineTo(0, 1144);
        this.path.lineTo(0, 56);
        this.path.closePath();
        this.dumpass = new Path2D(); // Whatever you think the name is, you are wrong, it isn't
        this.dumpass.moveTo(266, 910);
        this.dumpass.quadraticCurveTo(266, 897, 254, 903);
        this.dumpass.lineTo(158, 950);
        this.dumpass.quadraticCurveTo(152, 953, 152, 958);
        this.dumpass.lineTo(152, 1120);
        this.dumpass.quadraticCurveTo(152, 1129, 170, 1129);
        this.dumpass.lineTo(258, 1129);
        this.dumpass.quadraticCurveTo(266, 1129, 266, 1121);
        this.dumpass.lineTo(266, 910);
        this.isInventory = false;
        this.scrollHeight = 1144;
        this.tick = 0;
    }

    drawInventory(parent) {
        const curveRadius = 24;
        const inventoryObjectHeight = 85;
        var ctx = parent.ctx;
        var inventoryTotalHeight = Math.max(parent.inventory.length * inventoryObjectHeight + 57, window.innerHeight - 56);
        this.scrollHeight = inventoryTotalHeight;
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.moveTo(0, 56);
        ctx.lineTo(266 + curveRadius, 56);
        ctx.quadraticCurveTo(266, 56, 266, 56 + curveRadius);
        ctx.lineTo(266, inventoryTotalHeight - curveRadius);
        ctx.quadraticCurveTo(266, inventoryTotalHeight, 266 + curveRadius, inventoryTotalHeight);
        ctx.lineTo(0, inventoryTotalHeight);
        ctx.closePath();
        ctx.fill();
        parent.inventory.forEach((item, i) => {
            var rootY = 57 + i * inventoryObjectHeight;
            var frCost = item.cost + (item.place.activeVariant ? item.place.variants[item.place.activeVariant - 1].eCost : 0);
            if (item.selected) {
                ctx.fillStyle = "#440000";
                ctx.fillRect(0, rootY, 266, inventoryObjectHeight);
            }
            ctx.font = "14px 'Chakra Petch'";
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.fillText(item.name, 30, rootY + 14);
            ctx.fillStyle = "white";
            var width = ctx.measureText(frCost + "").width;
            ctx.fillRect(246 - width, rootY, width, 18);
            ctx.fillStyle = "black";
            ctx.fillText(frCost, 246 - width, rootY + 14);
            ctx.fillStyle = "blue";
            ctx.font = "10px 'Chakra Petch'";
            ctx.fillText(item.descriptionL1, 20, rootY + 40);
            ctx.fillText(item.descriptionL2, 20, rootY + 50);
            ctx.fillStyle = "green";
            ctx.fillText("VARIANT: " + (item.place.activeVariant ? item.place.variants[item.place.activeVariant - 1].name : "N/A"), 20, rootY + 60);
            item.hovered = false;
            if (parent.status.score >= frCost && item.stack != 0) {
                if (parent.mouseX < 266 && parent.mouseY + parent.sideScroll > rootY && parent.mouseY + parent.sideScroll < rootY + inventoryObjectHeight) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "white";
                    ctx.strokeRect(0, rootY, 266, inventoryObjectHeight);
                    item.hovered = true;
                }
            }
        });
    }

    draw(parent, interpolator) {
        var ctx = parent.ctx;
        if (this.isInventory) {
            this.drawInventory(parent);
            return;
        }
        if (parent.minimalistic) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 56, 266, 1144);
        }
        else {
            ctx.fillStyle = "black";
            ctx.fill(this.path);
            ctx.beginPath();
            ctx.roundRect(46, 66, 220, 210, 14);
            ctx.fill();
            ctx.fill(this.dumpass);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            ctx.stroke(this.dumpass);
        }

        ctx.font = "20px 'Chakra Petch'";
        var t = "READY";
        if (parent.status.isReady) {
            ctx.fillStyle = "red";
        }
        else {
            ctx.fillStyle = "green";
            t = "NOT READY";
        }
        ctx.fillRect(20, 700, 220, 20);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(t, 135, 718);

        ctx.font = "bold 14px 'Chakra Petch'";
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        ctx.fillText("X", 20, 632 + 14);
        ctx.fillText("Y", 148, 632 + 14);
        ctx.font = "24px 'Chakra Petch'";
        ctx.fillText(parent.gameX, 20, 650 + 24);
        ctx.fillText(parent.gameY, 148, 650 + 24);
        ctx.fillStyle = "#333";
        ctx.fillRect(18, 487, 218, 2);
        ctx.fillRect(18, 771, 218, 2);

        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = 1;
        ctx.strokeRect(197, 1060, 26, 26);
        if (parent.controls.up) {
            ctx.fillRect(197, 1060, 26, 26);
        }    
        ctx.strokeRect(168, 1089, 26, 26);
        if (parent.controls.left) {
            ctx.fillRect(168, 1089, 26, 26);
        }
        ctx.strokeRect(197, 1089, 26, 26);
        if (parent.controls.down) {
            ctx.fillRect(197, 1089, 26, 26);
        }
        ctx.strokeRect(226, 1089, 26, 26);
        if (parent.controls.right) {
            ctx.fillRect(226, 1089, 26, 26);
        }
        if (parent.castle) {
            ctx.strokeRect(226, 1060, 26, 26);
            ctx.fillRect(226, 1060, 26, 26);
            ctx.beginPath();
            ctx.save();
            ctx.translate(238, 1072);
            var ang = Math.atan2(parent.castle.y - parent.gameY, parent.castle.x - parent.gameX);
            ctx.rotate(ang);
            ctx.moveTo(6, 0);
            ctx.lineTo(-6, -3);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-6, 3);
            ctx.closePath();
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.restore();
            ctx.beginPath();
            ctx.arc(209, 992, 50, 0, Math.PI * 2);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(209, 992, 4, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(209, 992, 33, 0, Math.PI * 2);
            ctx.moveTo(226, 992);
            ctx.arc(209, 992, 17, 0, Math.PI * 2);
            ctx.stroke();
            var nearestValue = Infinity;
            Object.values(parent.objects).forEach(object => {
                var dx = object.getX(interpolator) - parent.castle.getX(interpolator);
                var dy = object.getY(interpolator) - parent.castle.getY(interpolator);
                var dist = dx * dx + dy * dy;
                if (!object.isOurs && dist < nearestValue && object.type != 'B' && object.isCompassVisible()) { // keep this as isOurs because this reports for everything that isn't distinctly controlled by us
                    nearestValue = dist;
                }
                if (dist < 400 * 400 && object.isCompassVisible() && object != parent.castle) {
                    if (object.isFriendly()) { // isFriendly also factors in teams
                        ctx.fillStyle = "rgb(47, 237, 51)";
                    }
                    else {
                        ctx.fillStyle = "rgb(231, 57, 30)";
                    }
                    var offsetX = (dx / 400) * 50;
                    var offsetY = (dy / 400) * 50;
                    ctx.beginPath();
                    ctx.arc(209 + offsetX, 992 + offsetY, 5, 0, Math.PI * 2);
                    ctx.globalAlpha = 0.5;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.arc(209 + offsetX, 992 + offsetY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.moveTo(209, 1069);
        ctx.lineTo(214, 1075);
        ctx.lineTo(204, 1075);
        ctx.closePath()
        ctx.moveTo(183, 1096);
        ctx.lineTo(177, 1101);
        ctx.lineTo(183, 1106);
        ctx.closePath();
        ctx.moveTo(204, 1098);
        ctx.lineTo(214, 1098);
        ctx.lineTo(209, 1104);
        ctx.closePath();
        ctx.moveTo(235, 1096);
        ctx.lineTo(241, 1101);
        ctx.lineTo(235, 1106);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke();

        var rUC = 0;
        Object.values(parent.objects).forEach(object => {
            if (object.rStrength) {
                if (parent.gameX > object.x - object.w / 2 && parent.gameX < object.x + object.w / 2 && parent.gameY > object.y - object.h / 2 && parent.gameY < object.y + object.h / 2) {
                    rUC += object.rStrength;
                }
            }
        });
        this.drawSquaresReadout(ctx, parent.castle ? 1 - parent.castle.health : 1, 18, 945, parent.minimalistic);
        this.drawSquaresReadout(ctx, rUC, 54, 945, parent.minimalistic);
        this.drawSquaresReadout(ctx, 1 - clamp(0, nearestValue / (800 * 800), 1), 90, 945, parent.minimalistic);
        if (!parent.minimalistic) {
            for (var i = 0; i < 33; i++) {
                if (i < 9) {
                    ctx.fillStyle = "red";
                }
                else if (i < 19) {
                    ctx.fillStyle = "#F3BB38";
                }
                else if (i < 29) {
                    ctx.fillStyle = "#2FED33";
                }
                else {
                    ctx.fillStyle = "white";
                }
                ctx.fillRect(42, 945 + i * 6, 4, 2);
                ctx.fillRect(78, 945 + i * 6, 4, 2);
            }
            ctx.fillStyle = "red";
            ctx.fillRect(18, 999, 88, 2);
        }
        this.scrollHeight = 1144;

        if (!parent.minimalistic) {
            ctx.fillStyle = "white";
            ctx.font = "12px 'Chakra Petch'";
            ctx.fillText("EARLY WARNING SYSTEM", 42, 852);
            var lert = clamp(0, nearestValue / (1200 * 1200), 1);
            var lengths = [
                218,
                203,
                183,
                155,
                120,
                78
            ];
            lengths.forEach(item => {
                this.drawBuuchie(ctx, "rgb(" + 255 * ((1 - lert) + (1 - (item - 78)/140) * 0.5) + ",0,0)", item - 18);
            });
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.moveTo(18, 884);
            ctx.lineTo(185, 884);
            ctx.moveTo(18, 905);
            ctx.lineTo(153, 905);
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.fillRect(17, 884, 185, 20);
            var error = "OK";
            if (nearestValue < 600 * 600) { // it's nearby
                error = "NEAR THRESHOLD";
            }
            if (nearestValue < 400 * 400) {
                error = "CLOSE PROXIMITY";
                this.tick++; // make the flash twice as fast if you're in close proximity.
            }
            this.tick++;
            if (this.tick > 60) {
                this.tick = 0;
            }
            ctx.font = "12px 'Chakra Petch'";
            ctx.fillStyle = "white";
            ctx.fillText(error, 61, 899);
            if (error != "OK") {
                if (this.tick > 30) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(18, 887, 39, 16);
                    ctx.fillStyle = "white";
                    ctx.font = "bold 12px 'Chakra Petch'";
                    ctx.fillText("WARN", 20, 899);
                }
            }
        }
        this.availability(ctx, "CASTLE PLACEMENT", 779, !parent.status.mouseWithinNarrowField || parent.superuser);
        this.availability(ctx, "OBJECT PLACEMENT", 803, parent.status.canPlaceObject || parent.status.placeAroundFort);

        Object.values(parent.objects).forEach(obj => {
            var scaleX = 220 / parent.gamesize;
            var scaleY = 210 / parent.gamesize
            var convertedX = 46 + obj.x * scaleX;
            var convertedY = 66 + obj.y * scaleY;
            var convertedW = obj.w * scaleX;
            var convertedH = obj.h * scaleY;
            if (!obj.isCompassVisible()) {
                return;
            }
            if (obj.isFriendly()) {
                ctx.fillStyle = "rgb(47, 237, 51)";
            }
            else {
                ctx.fillStyle = "rgb(231, 57, 30)";
            }
            if (obj.type == "R" || obj.type == "c") {
                ctx.beginPath();
                ctx.moveTo(convertedX, convertedY - 3);
                ctx.lineTo(convertedX + 3, convertedY);
                ctx.lineTo(convertedX, convertedY + 3);
                ctx.lineTo(convertedX - 3, convertedY);
                ctx.closePath();
                ctx.fill();
            }
            else if (obj.type == "B") {
                ctx.fillStyle = "#555";
                ctx.translate(convertedX, convertedY);
                ctx.rotate(obj.a);
                ctx.fillRect(-convertedW / 2, -convertedH / 2, convertedW, convertedH);
                ctx.rotate(-obj.a);
                ctx.translate(-convertedX, -convertedY);
            }
            else {
                ctx.beginPath();
                ctx.arc(convertedX, convertedY, 3, 0, Math.PI * 2);
                ctx.globalAlpha = 0.5;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.arc(convertedX, convertedY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "white";
            ctx.fillRect(46 + parent.gameX * scaleX - 1, 66 + parent.gameY * scaleY - 1, 2, 2);
        });

        if (parent.castle) {
            ctx.font = "14px 'Chakra Petch'";
            ctx.fillStyle = "#CCC";
            ctx.fillText("UPGRADES", 18, 448 + 14);
            this.upgradeHovered = undefined;
            this.drawUpgradeBar(parent, "g", "GUN", (parent.castle.highestUpgradeTier('b') + 1)/4, parent.castle.highestUpgradeTier('b')/4, 505, parent.minimalistic);
            this.drawUpgradeBar(parent, "s", "CLOAKING", (parent.castle.highestUpgradeTier('s') + 1)/2, (parent.castle.highestUpgradeTier('s'))/2, 539, parent.minimalistic);
            this.drawUpgradeBar(parent, "f", "DRIVE", (parent.castle.highestUpgradeTier('f') + 1)/3, parent.castle.highestUpgradeTier('f')/3, 573, parent.minimalistic);
            this.drawUpgradeBar(parent, "h", "HEALTH", (parent.castle.highestUpgradeTier('h') + 1)/4, parent.castle.highestUpgradeTier('h')/4, 607, parent.minimalistic);
        }
    }

    drawUpgradeBar(parent, lItem, label, projected, current, rootY, minimal) {
        var ctx = parent.ctx;
        ctx.font = "12px 'Chakra Petch'";
        ctx.textAlign = "left";
        var tWid = ctx.measureText(label).width;
        ctx.fillStyle = "white";
        ctx.fillRect(69 - tWid, rootY, tWid, 16);
        ctx.fillStyle = "black";
        ctx.fillText(label, 69 - tWid, rootY + 12);
        ctx.font = "bold 8px 'Chakra Petch'";
        ctx.fillStyle = "#888";
        ctx.fillText(lItem, 69 - tWid - 10, rootY + 4);
        ctx.fillStyle = "#222";
        ctx.fillRect(69, rootY, 162, 8);
        ctx.fillRect(69, rootY + 8 + 4, 162, 4);
        ctx.fillStyle = "white";
        ctx.fillRect(69, rootY + 8 + 4, 162 * current, 4);
        if (minimal) {
            ctx.fillStyle = "#555";
            ctx.fillRect(69, rootY, 162 * projected, 8);
        }
        else {
            ctx.save();
            ctx.beginPath();
            ctx.rect(69, rootY, 162 * projected, 8);
            ctx.clip();
            ctx.beginPath();
            for (var i = -2; i < 42; i ++) {
                ctx.moveTo(69 + i * 4, rootY + 8);
                ctx.lineTo(69 + i * 4 + 8, rootY);
            }
            ctx.strokeStyle = "white";
            ctx.lineWidth = 0.3;
            ctx.stroke();
            ctx.restore();
        }
        if (current < 1) {
            if (parent.mouseX > 69 && parent.mouseX < 69 + 162 && parent.mouseY + parent.sideScroll > rootY && parent.mouseY + parent.sideScroll < rootY + 16) {
                this.upgradeHovered = lItem;
            }
        }
    }

    availability(ctx, title, rootY, value) {
        ctx.font = "bold 12px 'Chakra Petch'";
        ctx.fillStyle = "white";
        ctx.fillText(title, 20, rootY + 12);
        ctx.fillStyle = value ? "#2FED33" : "#E7391E";
        ctx.fillRect(153, rootY, value ? 66 : 82, 16);
        ctx.fillStyle = value ? "black" : "white";
        ctx.fillText(value ? "AVAILABLE" : "UNAVAILABLE", 155, rootY + 12);
    }

    drawBuuchie(ctx, color, pos) {
        ctx.strokeStyle = "white";
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(18, 869);
        ctx.quadraticCurveTo(18, 861, 26, 861);
        ctx.lineTo(18 + pos - 8, 861);
        ctx.quadraticCurveTo(18 + pos, 861, 18 + pos - (8/68 * pos/2), 869);
        ctx.lineTo(18 + pos / 2, 861 + 68);
        ctx.lineTo(18, 861 + 68)
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawSquaresReadout(ctx, valueOf, rootX, rootY, minimal) {
        if (minimal) {
            ctx.fillStyle = "white";
            ctx.fillRect(rootX, rootY, 16, 194);
            ctx.fillStyle = "#555";
            ctx.fillRect(rootX, rootY + 194 * (1 - valueOf), 16, 194 * valueOf);
        }
        else {
            valueOf = clamp(0, valueOf, 1);
            valueOf = 1 - valueOf;
            valueOf *= 33;
            for (var i = 0; i < 33; i++) {
                if (i >= valueOf) {
                    if (i < 9) {
                        ctx.fillStyle = "red";
                    }
                    else {
                        ctx.fillStyle = "#B8B8B8";
                    }
                }
                else {
                    ctx.fillStyle = "#222";
                }
                ctx.fillRect(rootX, rootY + i * 6, 16, 2);
            }
        }
    }

    clickies(parent) {
        this.inventorySelected = undefined;
        parent.inventory.forEach(item => {
            if (item.hovered && (parent.status.moveShips || parent.status.isRTF || parent.superuser)) {
                if (item.selected) {
                    item.selected = false;
                }
                else {
                    if (item.place.word) { // it's an object to place
                        this.inventorySelected = item;
                        item.selected = true;
                    }
                    else {
                        if (item.stack) {
                            item.stack--;
                        }/*
                        if (!item.place.upgrade) {
                            parent.comms.cost(item.cost);
                        }*/
                    }
                    if (item.place.cbk) {
                        item.place.cbk();
                    }
                    if (item.place.upgrade) {/*
                        if (item.place.upgrade.effect == "castle") {
                            parent.upgrade(parent.castle.id, item.place.upgrade.word);
                        }*/
                        alert("DIRECT UPGRADES ARE DEPRECATED");
                    }
                    if (item.place.shop) {
                        parent.shop(item.place.shop);
                    }
                }
            }
            else {
                item.selected = false;
            }
        });
        if (this.upgradeHovered) {
            const prices = {
                "g": 30,
                "s": 40,
                "f": 70,
                "h": 150
            };
            if (parent.status.score >= prices[this.upgradeHovered]) {
                parent.shop(this.upgradeHovered);
                parent.score -= prices[this.upgradeHovered]; // this is not authoritative, but should be accurate, so accidental doubleclicks won't end up in disconnection (because cost message lag)
            }
        }
        if (!this.isInventory) {
            if (parent.mouseX > 20 && parent.mouseX < 260 && parent.mouseY + parent.sideScroll > 700 && parent.mouseY + parent.sideScroll < 720) {
                parent.status.isReady = !parent.status.isReady;
                parent.setReadyState(parent.status.isReady);
            }
        }
    }
}


class GameObject {
    constructor(parent, x, y, w, h, a, type, editable, id, banner) {
        this.x = x;
        this.xOld = x;
        this.y = y;
        this.yOld = y;
        this.w = w;
        this.wOld = w;
        this.h = h;
        this.hOld = h;
        this.a = a;
        this.aOld = a;
        this.type = type;
        this.isEditable = editable;
        this.id = id;
        this.banner = banner;
        this.health = 0;
        this.upgrades = [];
        this.goalPos = {
            x: this.x,
            y: this.y,
            a: this.a,
            pathLen: 0,
            initialX: this.x,
            initialY: this.y,
            hasChanged: false
        };
        this.box = this.bbox();
        this.isOurs = false;
        this.isHovered = false;
        this.bodyHovered = false;
        this.editState = 0; // 0 = none; 1 = picked up, moving; 2 = picked up, setting angle
        this.didMove = true; // whether or not it's moved since last tick
        this.parent = parent;
        this.mouseIsDown = false;
        this.rightMouse = false;
    }

    highestUpgradeTier(upgrade) {
        var highestTier = 0;
        this.upgrades.forEach(item => {
            if (item.startsWith(upgrade)) {
                if (highestTier == 0) {
                    highestTier = 1;
                }
                if (item[item.length - 1] > highestTier) {
                    highestTier = item[item.length - 1];
                }
            }
        });
        return highestTier;
    }

    getTypeString() {
        if (this.type == "c") {
            return "CASTLE";
        }
        if (this.type == "R") {
            return "RTF";
        }
        if (this.type == "w") {
            return "WALL";
        }
        if (this.type == "b") {
            return "BULLET";
        }
        if (this.type == "C") {
            return "CHEST";
        }
        if (this.type == "F") {
            return "FORT";
        }
        if (this.type == "G") {
            return "GREEN THUMB";
        }
        if (this.type == "g") {
            return "GOLD BAR";
        }
        return "SHIP";
    }

    getVx() {
        return this.x - this.xOld;
    }

    getVy() {
        return this.y - this.yOld;
    }

    isTeammate() {
        return this.parent.castle && this.parent.teams[this.banner] && this.parent.teams[this.banner] == this.parent.teams[this.parent.castle.banner];
    }

    isFriendly() {
        return this.isOurs || this.isTeammate();
    }

    getFriendlinessString() {
        if (this.isOurs) {
            return "OURS";
        }
        else if (this.isTeammate()) {
            return "TEAMMATE"
        }
        else if (this.banner == 0) {
            return "NEUTRAL";
        }
        return "ENEMY";
    }

    interpolate(value, property) {
        return this[property] * value + this[property + "Old"] * (1 - value);
    }

    getX(interpolator) {
        return this.interpolate(interpolator, "x");
    }

    getY(interpolator) {
        return this.interpolate(interpolator, "y");
    }

    getA(interpolator) {
        return this.interpolate(interpolator, "a");
    }

    getW(interpolator) {
        return this.interpolate(interpolator, "w");
    }

    getH(interpolator) {
        return this.interpolate(interpolator, "h");
    }

    draw(master, interpolator) {
        var lowX, lowY = master.transformPoint(this.box[0], this.box[1]);
        var highX, highY = master.transformPoint(this.box[2], this.box[3]);
        if (lowX > window.innerWidth || highX < 0 || lowY > window.innerHeight || highY < 0) {
            return;
        }
        var ctx = master.ctx;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "white";
        var w = this.getW(interpolator);
        var h = this.getH(interpolator);
        var a = this.getA(interpolator);
        var x = this.getX(interpolator);
        var y = this.getY(interpolator);
        if (this.carried && !master.status.moveShips) {
            this.goalPos.x = x;
            this.goalPos.y = y;
            this.goalPos.angle = a;
        }
        if (this.upgrades.indexOf("s2") != -1) {
            if (Math.abs(this.x - this.xOld) < 0.5 && Math.abs(this.y - this.yOld) < 0.5) {
                if (!this.isOurs && !master.status.moveShips && !master.superuser) {
                    return;
                }
            }
        }
        ctx.translate(x, y);
        ctx.rotate(a);
        if (this.type == "R") {
            ctx.drawImage(document.querySelector("img#rtf"), -40, -40);
            var dX = this.xOld - this.x;
            var dY = this.yOld - this.y;
            dX *= dX;
            dY *= dY;
            if (master.castle == this) {
                if (master.controls.up) {
                    master.drawThruster(0, 40, 20, 20, 15);
                }
            }
            else if (dX + dY > 25) {
                master.drawThruster(0, 40, 20, 20, 15);
            }
        }
        else if (this.type == "c") {
            ctx.drawImage(document.querySelector("img#castle"), -50, -50);
        }
        else if (this.type == "C") {
            ctx.drawImage(document.querySelector("img#chest"), -15, -17);
        }
        else if (this.type == "G") {
            ctx.fillStyle = "blue";
            ctx.fillRect(-15, -10, 30, 20);
            ctx.fillStyle = "red";
            ctx.fillRect(-2.5, -20, 5, 40);
            ctx.fillRect(-10, -25, 20, 5);
            ctx.fillRect(-10, 20, 20, 5);
            ctx.fillStyle = "yellow";
            ctx.fillRect(15, -2.5, 170, 5);
        }
        else if (this.type == 'g') {
            ctx.fillStyle = "gold";
            ctx.fillRect(-25, -15, 50, 30);
        }
        else if (this.type == "f") {
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(document.querySelector("img#ship"), -17, -21);
            ctx.rotate(-Math.PI / 2);
        }
        else if (this.type == "b") {
            ctx.fillStyle = "white";
            ctx.fillRect(-w / 2, -h / 2, w, h);
        }
        else if (this.type == "w") {
            ctx.drawImage(document.querySelector("img#wall"), -30, -30, 60, 60);
        }
        else if (this.type == "S") {
            var image = document.querySelector("img#seed1");
            if (this.seedCompVal >= 50) {
                image = document.querySelector("img#seed2");
            }
            ctx.drawImage(image, -8, -8);
        }
        else if (this.type == "K") {
            ctx.fillStyle = "#555";
            for (var i = 0; i < 6; i++) {
                ctx.fillRect(-w / 2 + i * 80, -h / 2, 10, h);
            }
            ctx.fillRect(-w/2, -5, w, 10);
        }
        else if (this.type == "t") {
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(document.querySelector("img#tie"), -31, -23);
            ctx.rotate(-Math.PI / 2);
        }
        else if (this.type == "h") {
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(document.querySelector("img#missile"), -13, -22);
            var dX = this.goalPos.x - this.x;
            var dY = this.goalPos.y - this.y;
            dX *= dX;
            dY *= dY;
            if (dX + dY > 25) {
                master.drawThruster(0, 22, 20, 20, 15);
            }
            ctx.rotate(-Math.PI / 2);
        }
        else if (this.type == "r") {

        }
        else if (this.type == "s") {
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(document.querySelector("img#sniper"), -24, -36);
            ctx.rotate(-Math.PI / 2);
        }
        else if (this.type == "B") {
            if (master.fancyBackground) {
                ctx.filter = "blur(20px)";
                var transformed = master.transformPoint(-w / 2, -h / 2);
                ctx.drawImage(ctx.canvas, transformed[0], transformed[1], w * master.zoomLevel, h * master.zoomLevel, -w / 2, -h / 2, w, h);
                ctx.filter = "none";
                ctx.fillStyle = "black";
                ctx.globalAlpha = 0.3;
            }
            else {
                ctx.fillStyle = "#555";
            }
            ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.globalAlpha = 1;
        }
        else {
            ctx.strokeRect(-w / 2, -h / 2, w, h);
        }
        ctx.rotate(-a);
        ctx.font = "10px 'Chakra Petch'";
        if (this.isOurs) {
            ctx.fillStyle = "orange";
            ctx.font = "bold 12px 'Chakra Petch'";
        }
        else{
            ctx.fillStyle = "yellow";
        }
        ctx.textAlign = "left";
        if (DEBUG) {
            ctx.fillText(this.type + "#" + this.id + " " + this.banner + "(" + master.banners[this.banner] + ")", -50, -h / 2 - 10);
        }
        ctx.translate(-x, -y);
        if (DEBUG) {
            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
        if (DEBUG) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.strokeRect(this.box[0], this.box[1], this.box[2] - this.box[0], this.box[3] - this.box[1]);
        }
        if ((this.isOurs || master.superuser) && this.isEditable) {
            ctx.strokeStyle = "green";
            ctx.fillStyle = "green";
            if (this.isHovered) {
            //    ctx.fillRect(this.goalPos.x * zoomLevel - 5, this.goalPos.y * zoomLevel - 5, 10, 10);
            }
            //ctx.strokeRect(this.goalPos.x * zoomLevel - 5, this.goalPos.y * zoomLevel - 5, 10, 10);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = "white";
            ctx.fillStyle = "#F3BB38";
            ctx.lineWidth = 1;
            ctx.lineTo(this.goalPos.x, this.goalPos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.translate(this.goalPos.x, this.goalPos.y);
            ctx.rotate(this.goalPos.a + Math.PI/2);
            if (this.parent.minimalistic) {
                ctx.strokeStyle = "#F3BB38";
            }
            else {
                var gradient = ctx.createLinearGradient(14, -14, 14, 14);
                gradient.addColorStop(0.0, "#F3BB38");
                gradient.addColorStop(0.5, "transparent");
                ctx.strokeStyle = gradient;
            }
            //ctx.moveTo(this.goalPos.x * zoomLevel, this.goalPos.y * zoomLevel);
            //ctx.lineTo((this.goalPos.x + Math.cos(this.goalPos.a) * 20) * zoomLevel, (this.goalPos.y + Math.sin(this.goalPos.a) * 20) * zoomLevel);
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(2, -13);
            ctx.lineTo(-2, -13);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(-this.goalPos.a - Math.PI/2);
            ctx.translate(-this.goalPos.x, -this.goalPos.y);
        }
        if (this.bodyHovered) {
            const fontSize = 16;
            ctx.fillStyle = "#F3BB38";
            ctx.font = fontSize + "px 'Chakra Petch'";
            var tooltipHeight = this.isOurs ? 4 * fontSize + 5 : 3 * fontSize + 5; // use isOurs here because we can't see what our teammates are doing, the game is not _nice_ that way.
            var tooltipWidth = Math.max(ctx.measureText("NEUTRAL").width + 4, ctx.measureText(master.banners[this.banner]).width + 4);
            ctx.fillRect(x - 40 - tooltipWidth, y - tooltipHeight/2, tooltipWidth, tooltipHeight);
            ctx.beginPath();
            ctx.moveTo(x - 41, y - 5);
            ctx.lineTo(x - 35, y);
            ctx.lineTo(x - 41, y + 5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.fillText(this.getTypeString(), x - 38 - tooltipWidth, y - tooltipHeight/2 + fontSize + 1);
            ctx.fillText(this.getFriendlinessString(), x - 38 - tooltipWidth, y - tooltipHeight / 2 + (fontSize + 1) * 2);
            ctx.fillText(master.banners[this.banner], x - 38 - tooltipWidth, y - tooltipHeight / 2 + (fontSize + 1) * 3)
            if (this.isOurs) {
                var dx = this.x - this.goalPos.initialX;
                var dy = this.y - this.goalPos.initialY;
                dx *= dx;
                dy *= dy;
                var displacement = Math.sqrt(dx + dy);
                var toPrint = Math.round((displacement / this.goalPos.pathLen) * 100) + "%";
                if (this.goalPos.pathLen == 0) {
                    toPrint = "0%";
                    if (this.goalPos.displacement == 0) {
                        toPrint = "100%";
                    }
                }
                if (this.seedCompVal != undefined) {
                    toPrint = this.seedCompVal + "%";
                }
                ctx.fillText(toPrint, x - 38 - tooltipWidth, y - tooltipHeight / 2 + (fontSize + 1) * 4);
            }
        }
        if (master.seeking == this) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "green";
            ctx.strokeRect(this.x - 50, this.y - 50, 100, 100);
        }
    }

    isChanged() {
        return this.xOld != this.x || this.yOld != this.y || this.aOld != this.a || this.wOld != this.w || this.hOld != this.h;
    }

    tick(game) {
        if (this.isChanged()) {
            this.box = this.bbox();
        }
        if (!this.didMove) {
            this.xOld = this.x;
            this.yOld = this.y;
            this.wOld = this.w;
            this.hOld = this.h;
            this.aOld = this.a;
        }
        this.didMove = false;
        if (this.goalPos.hasChanged) {
            this.goalPos.hasChanged = false;
            game.move(this.id, this.goalPos.x, this.goalPos.y, this.goalPos.a);
        }
    }

    bbox() { // Produces a high-quality bbox of rotated rectangular objects
        var topleft = new Vector(-this.w / 2, -this.h / 2).rotate(this.a);
        var topright = new Vector(this.w / 2, -this.h / 2).rotate(this.a);
        var bottomleft = new Vector(-this.w / 2, this.h / 2).rotate(this.a);
        var bottomright = new Vector(this.w / 2, this.h / 2).rotate(this.a);
        var minX = topleft.sort((v1, v2) => {
            return v1.x < v2.x;
        }).with(topright).with(bottomleft).with(bottomright).x;
        var minY = topleft.sort((v1, v2) => {
            return v1.y < v2.y;
        }).with(topright).with(bottomleft).with(bottomright).y;
        var maxX = topleft.sort((v1, v2) => {
            return v1.x > v2.x;
        }).with(topright).with(bottomleft).with(bottomright).x;
        var maxY = topleft.sort((v1, v2) => {
            return v1.y > v2.y;
        }).with(topright).with(bottomleft).with(bottomright).y;
        return [this.x + minX, this.y + minY, this.x + maxX, this.y + maxY];
    }

    interact(game) {
        this.isOurs = game.mine.indexOf(this.id) != -1;
        if (!game.status.moveShips && !game.status.isRTF && !game.superuser) {
            this.editState = 0;
            game.locked = false;
        }
        if (this.editState == 1) {
            this.goalPos.x = game.gameX;
            this.goalPos.y = game.gameY;
            this.goalPos.initialX = this.x;
            this.goalPos.initialY = this.y;
            var dx = this.goalPos.x - this.goalPos.initialX;
            var dy = this.goalPos.y - this.goalPos.initialY;
            dx *= dx;
            dy *= dy;
            this.goalPos.pathLen = Math.sqrt(dx + dy);
            this.goalPos.hasChanged = true;
        }
        else if (this.editState == 2) {
            this.goalPos.a = new Vector(game.gameX - this.goalPos.x, game.gameY - this.goalPos.y).angle();
            this.goalPos.hasChanged = true;
        }
    }

    click(game) { // called on EVERY CLICK, not just clicks where it's hovered
        if (!game.status.moveShips && !game.status.isRTF && !game.superuser) {
            return;
        }
        if (this.editState == 1) {
            this.editState = 2;
        }
        else if (this.editState == 2) {
            this.editState = 0;
            game.locked = false;
        }
        if (!game.locked) {
            if (this.isHovered) {
                this.editState = 1;
                game.locked = true;
            }
        }
    }

    isCompassVisible() { // Can it be seen on a compass?
        const hidden = ["s", "b", "C", "w", "F", "r"]; // List of types that can't be displayed on minimap/compass
        var isSniper = this.upgrades.indexOf("s")!= -1;
        return this.isOurs || (hidden.indexOf(this.type) == -1 && !isSniper);
    }

    upgrade(upgrade) {
        this.upgrades.push(upgrade);
    }
}


class Game {
    constructor(connection) {
        this.comms = connection;
        connection.listen((command, args) => {this.onmessage(command, args)});
        var doPing = connection.sendHandle("Ping");
        this.doPlace = connection.sendHandle("Place");
        this.doConnect = connection.sendHandle("Connect");
        this.move = connection.sendHandle("Move");
        this.doA2A = connection.sendHandle("LaunchA2A");
        this.upgrade = connection.sendHandle("UpgradeThing");
        this.rtf = connection.sendHandle("PilotRTF");
        this.chat = connection.sendHandle("Chat");
        this.shop = connection.sendHandle("Shop");
        this.doGodReset = connection.sendHandle("GodReset");
        this.doGodNuke = connection.sendHandle("GodNuke");
        this.doGodFlip = connection.sendHandle("GodFlip");
        this.doGodDisconnect = connection.sendHandle("GodDisconnect");
        this.doGodDelete = connection.sendHandle("GodDelete");
        this.doGodBless = connection.sendHandle("GodBless");
        this.setReadyState = connection.sendHandle("ReadyState");
        this.setListeners(connection);
        setInterval(() => {
            this.status.online = this.ponged;
            doPing();
            this.ponged = false;
        }, 100);
        this.gamesize = 0;
        this.zoomLevel = 0.7;
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        this.health = -1;
        this.hasPlacedCastle = false;
        this.castle = undefined;
        this.accurateRTF = false;
        this.lastFrameTime = 0;
        this.ctx.makeRoundRect = function (x, y, width, height, rx, ry) { // Stolen from #platformer
            this.translate(x, y);
            this.moveTo(rx, 0);
            this.lineTo(width - rx, 0);
            this.quadraticCurveTo(width, 0, width, ry);
            this.lineTo(width, height - ry);
            this.quadraticCurveTo(width, height, width - rx, height);
            this.lineTo(rx, height);
            this.quadraticCurveTo(0, height, 0, height - ry);
            this.lineTo(0, ry);
            this.quadraticCurveTo(0, 0, rx, 0);
            this.translate(-x, -y);
        };
        if (this.ctx.roundRect == undefined) { // Polyfill: roundRect doesn't have very good browser support (it's quite new: Chrome released support just last year and Firefox this year), so this is necessary. Keep your browsers up to date, dammit!
            var ctx = this.ctx;
            ctx.roundRect = function (x, y, width, height, radii) {
                ctx.makeRoundRect(x, y, width, height, radii, radii);
            };
        }
        this.status = {
            spectating: false,
            counting: false,
            playing: false,
            online: false,
            moveShips: false,
            isTeamLeader: false,
            wallsRemaining: 4, // 4 on the first turn
            wallsTurn: 2, // 2 every next turn, but Extra Walls can increase this.
            wait: true,
            score: 0,
            counter: 0, // Set by ticks
            tickTime: 1000 / 30, // Number of milliseconds between ticks or !s; this is adjusted based on real-time data.
            lastTickTime: -1,
            canPlaceObject: false, // if the mouse is close to the home castle with 400 tolerance
            placeAroundFort: false, // if the mouse is close to any fort with 400 tolerance
            mouseWithinNarrowField: false, // if the mouse is close to any game object with 400 tolerance
            mouseWithinWideField: false, // if the mouse is close to any game object with 600 tolerance
            isRTF: false,
            getTableBite() { // Don't ask
                return this.online ? (this.spectating ? "SPECTATING" : "ONLINE") : "OFFLINE";
            },
            getChairBites() { // Don't ask even more
                return this.wait ? "WAITING" : (this.moveShips ? "MOVE SHIPS" : "PLAY");
            },
            ticksRemaining() {
                return this.counter;
            },
            getTimes(interpolator) {
                var _ms = this.ticksRemaining() * this.tickTime + interpolator * this.tickTime;
                var _secs = _ms / 1000;
                var minutes = Math.floor(_secs / 60);
                var seconds = Math.floor(_secs % 60);
                var hundreds = _secs % 1;
                hundreds = Math.round(hundreds * 100);
                return [minutes, seconds, hundreds];
            },
            getTimeString(interpolator) {
                var times = this.getTimes(interpolator ? interpolator : 0);
                return "- " + zeroes("" + times[0]) + ":" + zeroes("" + times[1]) + ":" + zeroes("" + times[2]);
            }
        };
        this.mouseX = 0; // Mouse position in UI
        this.mouseY = 0;
        this.gameX = 0; // Mouse position in game
        this.gameY = 0;
        this.cX = 0; // Distance from the top-left corner of the actual gameboard to the center of the view screen
        this.cY = 0;
        this.sideScroll = 0;
        this.sidebar = new Sidebar();
        this.objects = {};
        this.banners = {}; // Relating banners to banner names
        this.teams = {}; // Relating player banners to team banners
        this.bgCall = undefined;
        this.mine = [];
        this.locked = false; // for objects to not be edited at the same time
        this.keysDown = {};
        this.a2a = 0;
        this.ponged = false;
        this.seekTime = 0;
        if (DEBUG) {
            this.deletePoints = [];
        }
        this.controls = {
            up: false,
            left: false,
            down: false,
            right: false,
            shoot: false
        };
        var carrierVariant = (name, vText) => {
            // bitbangs. it's fuuun!
            var x = 0;
            var y = 0;
            var ret = {
                name: name,
                eCost: 0,
                variantID: 0
            };
            for (var i = 0; i < vText.length; i++) {
                var bit = y + x * 2;
                bit = 9 ** bit; // 8 possibilities per berth: BLANK, hypersonic, basic fighter, tie fighter, sniper, nuke, turret, missile launcher
                if (vText[i] == '\n') {
                    y++;
                    x = -1;
                }
                else if (vText[i] == 'h') {
                    ret.variantID += 1 * bit;
                    ret.eCost += 5;
                }
                else if (vText[i] == 'f') {
                    ret.variantID += 2 * bit;
                    ret.eCost += 10;
                }
                else if (vText[i] == 't') {
                    ret.variantID += 3 * bit;
                    ret.eCost += 20;
                }
                else if (vText[i] == 's') {
                    ret.variantID += 4 * bit;
                    ret.eCost += 30;
                }
                else if (vText[i] == 'n') {
                    ret.variantID += 5 * bit;
                    ret.eCost += 300;
                }
                else if (vText[i] == 'T') {
                    ret.variantID += 6 * bit;
                    ret.eCost += 100;
                }
                else if (vText[i] == 'm') {
                    ret.variantID += 7 * bit;
                    ret.eCost += 100;
                }
                else if (vText[i] == '_') {
                    ret.variantID += 0 * bit;
                    ret.eCost += 0;
                }
                else if (vText[i] == 'g') {
                    ret.variantID += 8 * bit;
                }
                else {
                    x--; // it's a blank space, don't increment x
                }
                x++;
            }
            return ret;
        };
        if (!localStorage.carriers) {
            localStorage.carriers = JSON.stringify([
                {
                    name: "MOFARD",
                    data: `T h n h T
                           T h n h T`
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                },
                {
                    name: "NULL",
                    data: ""
                }
            ]);
        }
        var compiledCarriers = [];
        var cDat = JSON.parse(localStorage.carriers);
        cDat.forEach(carrier => {
            compiledCarriers.push(carrierVariant(carrier.name, carrier.data));
        });
        this.inventory = [
            {
                name: "HYPERSONIC MISSILE",
                cost: 5,
                descriptionL1: "Very fast, very erratic missile that does",
                descriptionL2: "damage by crashing into enemies; does not shoot.",
                place: {
                    word: "h"
                }
            },
            {
                name: "ANTI-RTF SMART MISSILE",
                cost: 7,
                descriptionL1: "Very fast missile with clever kinematics that chases",
                descriptionL2: "down real time fighters and crashes into them.",
                place: {
                    word: "a"
                }
            },
            {
                name: "SEED",
                cost: 10,
                descriptionL1: "A seed that eventually grows into a chest.",
                descriptionL2: "",
                place: {
                    word: "S"
                }
            },
            {
                name: "BASIC FIGHTER",
                cost: 10,
                descriptionL1: "Low motion speed, medium shot cooldown,",
                descriptionL2: "medium bullet range, 2 health.",
                place: {
                    word: "f"
                }
            },
            {
                name: "TIE FIGHTER",
                cost: 20,
                descriptionL1: "Slightly faster double barreled basic fighter.",
                descriptionL2: "Shoots out of back as well as front.",
                place: {
                    word: "t"
                }
            },
            {
                name: "SNIPER",
                cost: 30,
                descriptionL1: "Very fast low-profile cloaked fighter.",
                descriptionL2: "High shot cooldown, very high shot range.",
                place: {
                    word: "s"
                }
            },
            {
                name: "+2 WALL",
                cost: 30,
                descriptionL1: "Place 2 extra walls around any castle or fort",
                descriptionL2: "every turn.",
                place: {
                    shop: 'w',
                    cbk() {
                        game.status.wallsTurn += 2;
                        game.status.wallsRemaining += 2;
                    }
                }
            },
            {
                name: "CARRIER",
                cost: 80,
                descriptionL1: "",
                descriptionL2: "",
                place: {
                    word: "K",
                    variants: compiledCarriers
                }
            },
            {
                name: "GOLD BAR",
                cost: 100,
                descriptionL1: "Easily-killed gold bar that grants 100 coins",
                descriptionL2: "to the killer. Useful for money transfers.",
                place: {
                    word: "g"
                }
            },
            {
                name: "TURRET",
                cost: 100,
                descriptionL1: "Stationary antiaircraft turret that swivels",
                descriptionL2: "towards enemy craft. Medium shot cooldown.",
                place: {
                    word: "T"
                }
            },
            {
                name: "MISSILE LAUNCHING SYSTEM",
                cost: 100,
                descriptionL1: "Stationary antiaircraft turret that swivels towards",
                descriptionL2: "enemy RTFs and fires heat-seaking missiles.",
                place: {
                    word: "m"
                }
            },
            {
                name: "FORT",
                cost: 120,
                descriptionL1: "Stationary, small low-profile fortress that you can place",
                descriptionL2: "fighters near. Can be placed anywhere. Backup castle.",
                place: {
                    word: "F"
                }
            },
            {
                name: "NUKE",
                cost: 300,
                descriptionL1: "Very fast well-controlled missile with a",
                descriptionL2: "high-yield nuclear warhead.",
                place: {
                    word: "n"
                }
            },
            {
                name: "GREEN THUMB",
                cost: 1000,
                descriptionL1: "Places seeds automatically.",
                descriptionL2: "",
                place: {
                    word: 'G'
                }
            }
        ];
    }

    setListeners (connection) {
        connection.setOnMessage("New", (id, type, x, y, a, editable, banner, w, h) => {
            type = String.fromCharCode(type);
            this.objects[id] = new GameObject(this, x, y, w, h, a, type, editable, id, banner);
            if ((type == "c" || type == "R") && this.mine.indexOf(id) != -1) {
                this.castle = this.objects[id];
                if (type == "R") {
                    this.status.isRTF = true;
                    this.inventory = [
                        {
                            name: "SEED",
                            cost: 10,
                            descriptionL1: "A seed that eventually grows into a chest.",
                            descriptionL2: "",
                            place: {
                                word: "S"
                            }
                        },
                        {
                            name: "BASIC FIGHTER",
                            cost: 10,
                            descriptionL1: "Low motion speed, medium shot cooldown,",
                            descriptionL2: "medium bullet range, 2 health.",
                            place: {
                                word: "f"
                            }
                        },
                        {
                            name: "+2 WALL",
                            cost: 30,
                            descriptionL1: "Place 2 extra walls around any castle or fort",
                            descriptionL2: "every turn.",
                            place: {
                                shop: 'w',
                                cbk() {
                                    game.status.wallsTurn += 2;
                                    game.status.wallsRemaining += 2;
                                }
                            }
                        },
                        {
                            name: "AIR TO AIR MISSILE",
                            cost: 100,
                            descriptionL1: "",
                            descriptionL2: "",
                            place: {
                                shop: 'a'
                            }
                        }
                    ];
                }
            }
        });
        connection.setOnMessage("Pong", () => {
            this.ponged = true;
        });
        connection.setOnMessage("Tick", (counter, mode) => {
            this.status.counter = counter;
            this.ponged = true;
            if (mode == 2) { // 0 = play, 1 = strat, 2 = waiting
                this.status.wait = true;
                if (!this.status.counting) {
                    this.status.counting = true;
                    notify("Countdown started: Game will begin in " + this.status.getTimeString());
                }
            }
            else {
                this.status.wait = false;
                this.tick();
                if (!this.status.playing) {
                    this.status.playing = true;
                    notify("Game has started!")
                }
            }
            var oldStatus = this.status.moveShips;
            this.status.moveShips = mode == 1;
            if (!this.status.moveShips) {
                this.status.isReady = false;
            }
            if (this.status.moveShips && !oldStatus) {
                this.enterMoveShips();
            }
            var curTime = window.performance.now();
            if (this.status.lastTickTime == -1) {
                this.status.lastTickTime = curTime - this.status.tickTime;
            }
            var gTickTime = curTime - this.status.lastTickTime;
            const drag = 0.995;
            this.status.tickTime = this.status.tickTime * drag + gTickTime * (1 - drag);
            this.status.lastTickTime = curTime;
        });
        connection.setOnMessage("Delete", (id) => {
            if (this.castle && id == this.castle.id) {
                delete this.castle;
                this.status.isRTF = false;
                this.status.spectating = true;
                this.mine = [];
            }
            if (DEBUG) {
                this.deletePoints.push([this.objects[id].x, this.objects[id].y]);
            }
            var index = this.mine.indexOf(id);
            if (index != -1) {
                this.mine.splice(index, 1);
            }
            delete this.objects[id];
        });
        connection.setOnMessage("Add", (id) => {
            this.mine.push(id);
        });
        connection.setOnMessage("BannerAdd", (banner, name) => {
            this.banners[banner] = name;
        });
        connection.setOnMessage("Radiate", (id, amount) => {
            this.objects[id].rStrength = amount;
        });
        connection.setOnMessage("Metadata", (gamesize) => {
            this.gamesize = gamesize;
            screen("gameui");
            if (!BARE && this.fancyBackground) {
                this.bgCall = prerenderBackground(this.gamesize); // Pre-draw the background image onto a hidden canvas
            }
            this._main();
        });
        connection.setOnMessage("SetScore", (score) => {
            this.status.score = score;
        });
        connection.setOnMessage("MoveObjectFull", (id, x, y, a, w, h) => {
            var obj = this.objects[id];
            if (!obj) {
                return;
            }
            obj.xOld = obj.x;
            obj.yOld = obj.y;
            obj.wOld = obj.w;
            obj.hOld = obj.h;
            obj.aOld = obj.a;
            obj.x = x;
            obj.y = y;
            obj.a = a;
            obj.w = w;
            obj.h = h;
            obj.didMove = true;
        });
        connection.setOnMessage("A2A", count => {
            this.a2a = count;
        });
        connection.setOnMessage("YouAreTeamLeader", () => {
            this.status.isTeamLeader = true;
        });
        connection.setOnMessage("Chat", (message, banner, priority) => {
            //console.log("banner " + args[1] + " sent a message with priority " + args[2] + ": " + args[0]);
            var chatEl = document.getElementById("chat-messages")
            var messageEl = document.createElement("p");
            messageEl.style.fontSize = 1 + priority * 0.2 + "em";
            var bannerSpan = document.createElement("span");
            bannerSpan.style.color = banner == 0 ? "magenta" : "red";
            bannerSpan.innerText = priority == 1 ? "👑 " : "";
            bannerSpan.innerText += banner == 0 ? "GOD" : this.banners[banner];
            messageEl.appendChild(bannerSpan);
            messageEl.appendChild(document.createTextNode(": " + message));
            chatEl.appendChild(messageEl);
            chatEl.scrollTo({
                top: chatEl.scrollHeight
            });
            if (banner == 0) {
                // GOD sent a message, we can't ignore it!
                document.getElementById("chat").classList.remove("hidden");
                console.log("GOT A MESSAGE FROM GOD!");
                console.log("God says: " + message);
            }
        });
        connection.setOnMessage("YouAreSpectating", () => {
            this.status.spectating = true;
        });
        connection.setOnMessage("End", (banner) => {
            if (this.castle && this.castle.banner == banner) {
                screen("youWin");
            }
            else {
                document.getElementById("winnerBanner").innerText = this.banners[banner];
                screen("gameOver");
            }
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            console.log("u luuz");
        });
        connection.setOnMessage("UpgradeThing", (id, upgrade) => {
            this.objects[id].upgrade(upgrade);
        });
        connection.setOnMessage("HealthUpdate", (id, health) => {
            this.objects[id].health = health;
        });
        connection.setOnMessage("BannerAddToTeam", (banner, team) => {
            this.teams[banner] = team;
            console.log(this.banners[banner] + " is in " + this.banners[team]);
        });
        connection.setOnMessage("YouLose", () => {
            screen("youLose");
            setTimeout(() => {
                screen("gameui");
            }, 1000);
        });
        connection.setOnMessage("SeedCompletion", (seedId, value) => {
            this.objects[seedId].seedCompVal = 100 - value;
        });
        connection.setOnMessage("Carry", (carrier, carried) => {
            this.objects[carried].carried = true;
            this.objects[carried].carrier = carrier;
            this.objects[carried].goalPos.x = this.objects[carried].x;
            this.objects[carried].goalPos.y = this.objects[carried].y;
            this.objects[carried].goalPos.a = this.objects[carried].angle;
        });
        connection.setOnMessage("UnCarry", (carried) => {
            this.objects[carried].carried = false;
        });
        connection.setOnMessage("YouAreGod", () => {
            this.superuser = true;
            this.status.wallsRemaining = Infinity;
            this.status.wallsTurn = Infinity;
        });
    }

    attemptWall(x, y) {
        if ((this.status.canPlaceObject || this.status.placeAroundFort) && this.status.wallsRemaining > 0) {
            this.place("w");
            this.status.wallsRemaining--;
        }
    }

    start(formdata) {
        var isSpectating = formdata.get("spectator") == "on";
        this.doConnect(formdata.get("password-input"), formdata.get("banner-name"), formdata.get("playmode"), isSpectating);
        this.fancyBackground = formdata.get("fancybg") == "on";
        this.minimalistic = formdata.get("minimalistic") == "on";
        this.mousemodeRTF = formdata.get("mousertf") == "on";
        if (formdata.get("crtCheckbox") == "on") {
            this.crt = prepCRT();
        }
    }
    
    air2air() {
        if (this.seeking && this.a2a > 0) {
            this.doA2A(this.seeking.id);
        }
    }

    drawThruster(rX, rY, w1, h, w2) {
        var pos = w2 * (Math.random() - 0.5);
        var grd = this.ctx.createLinearGradient(rX, rY, rX, rY + h); // lovingly yoinked from https://github.com/landgreen/planetesimals
        grd.addColorStop(0, 'rgba(160, 192, 255, 1)');
        grd.addColorStop(1, 'rgba(160, 192, 255, 0)');
        this.ctx.fillStyle = grd;
        this.ctx.beginPath();
        this.ctx.moveTo(rX - w1 / 2, rY);
        this.ctx.lineTo(rX + w1 / 2, rY);
        this.ctx.lineTo(rX + pos, rY + h - Math.random() * 5);
        this.ctx.closePath();
        this.ctx.fill();
    }

    onmessage(command, args) {
        console.warn("UNRECOGNIZED COMMAND " + command);
        console.log(args);
    }

    _main() {
        this.interactionLoop();
        this.renderLoop();
        if (!this.harikari) {
            requestAnimationFrame(() => { this._main() });
        }
    }

    transformPoint(x, y) {
        const matrix = this.ctx.getTransform();
        return [
            matrix.a * x + matrix.c * y + matrix.e,
            matrix.b * x + matrix.d * y + matrix.f,
        ];
    }

    renderGameboard(interpolator, zoomLevel) {
        this.ctx.fillStyle = "#111111";
        this.ctx.save();
        if (this.superuser) {
            this.ctx.drawImage(document.getElementById("god"), 0, 0, window.innerWidth, window.innerHeight);
        }
        else if (this.bgCall) {
            this.bgCall(this.cX - window.innerWidth / 2, this.cY - window.innerHeight / 2);
            this.ctx.drawImage(document.getElementById("background"), 0, 0); //offx, offy);
        }
        this.ctx.translate(window.innerWidth / 2 - this.cX, window.innerHeight / 2 - this.cY);
        if (this.status.isRTF && this.accurateRTF && !this.status.moveShips) {
            this.ctx.translate(this.cX, this.cY);
            this.ctx.rotate(-this.castle.getA(interpolator));
            this.ctx.translate(-this.cX, -this.cY);
        }
        this.ctx.scale(zoomLevel, zoomLevel);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.gamesize, this.gamesize);
        //this.ctx.fillRect(0, 0, this.gamesize, this.gamesize);
        Object.values(this.objects).forEach((item) => {
            item.draw(this, interpolator);
        });
        if (DEBUG) {
            this.deletePoints.forEach(item => {
                this.ctx.beginPath();
                this.ctx.arc(item[0], item[1], 5, 0, Math.PI * 2);
                this.ctx.fill();
            });
            if (this.status.isRTF) {
                var dx = this.gameX - this.castle.x;
                var dy = this.gameY - this.castle.y;
                var mAngle = Math.atan2(dy, dx);
                var da = ringDist(mAngle, this.castle.a - Math.PI/2);
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.strokeStyle = "orange";
                this.ctx.moveTo(this.castle.x, this.castle.y);
                this.ctx.lineTo(this.castle.x + Math.cos(this.castle.a) * 100, this.castle.y + Math.sin(this.castle.a) * 100);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.strokeStyle = "red";
                this.ctx.moveTo(this.castle.x, this.castle.y);
                this.ctx.lineTo(this.castle.x + Math.cos(mAngle) * 100, this.castle.y + Math.sin(mAngle) * 100);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.strokeStyle = "blue";
                this.ctx.arc(this.castle.x, this.castle.y, 50, mAngle, mAngle + da);
                this.ctx.stroke();
            }
        }
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.gameX - 5, this.gameY - 5, 10, 10);
        this.ctx.restore();
    }

    fortPlace() {
        return this.sidebar.inventorySelected && this.sidebar.inventorySelected.place.word && this.status.placeAroundFort && passive.indexOf(this.sidebar.inventorySelected.place.word) != -1;
    }

    cantPlace() { // COSMETIC: this is meant for user displays, NOT for logic.
        if (!this.status.hasPlacedCastle && this.status.mouseWithinNarrowField) { // if it isn't 
            return true;
        }
        if (this.sidebar.inventorySelected) {
            if (this.sidebar.inventorySelected.place.word == "F" && !this.status.mouseWithinNarrowField && !this.superuser) {
                return false;
            }
            if (!this.status.canPlaceObject && !this.fortPlace()) {
                return true;
            }
        }
        return false;
    }

    drawStatus(interpolator) {
        this.ctx.fillStyle = "#555555";
        this.ctx.font = "12px 'Chakra Petch'";
        this.ctx.textAlign = "left";
        this.ctx.fillText("SYSTEM STATUS (" + Math.round(this.status.FPS) + " FPS)", 18, 9 + 15.6 / 2);
        this.ctx.textAlign = "right";
        this.ctx.fillText("SCORE", window.innerWidth - 18, 9 + 15.6 / 2);
        this.ctx.font = "16px 'Chakra Petch'";
        this.ctx.fillStyle = "#CBCAFF";
        this.ctx.fillText(this.superuser ? "∞" : this.status.score, window.innerWidth - 18, 28 + 6 + 21 / 2);
        this.ctx.fillText(this.a2a, window.innerWidth - 18, 28 + 6 + 21 * 2);
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "left";
        var word = this.status.getTableBite();
        var width = this.ctx.measureText(word).width;
        this.ctx.fillRect(18, 28, width, 21);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(word, 18, 28 + 6 + 21 / 2);
        word = this.status.getChairBites();
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.status.getChairBites(), 18 + width + 13, 28 + 6 + 21 / 2);
        width += 13 + this.ctx.measureText(word).width;
        if (this.cantPlace()) {
            this.ctx.fillStyle = "red";
            this.ctx.textAlign = "center";
            this.ctx.fillText("[ CAN'T PLACE HERE ]", window.innerWidth/2, 18);
        }
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#CBCAFF";
        this.ctx.font = "32px 'Chakra Petch'";
        this.ctx.fillText(this.status.getTimeString(interpolator), 18 + width + 17, 28 + 6 + 21 / 2);
    }

    renderUI(interpolator) {
        const MARKER_SPACING = 40;
        const MARKER_START_X = 322;
        const MARKER_START_Y = 122;
        this.ctx.translate(0, -this.sideScroll);
        //this.sidebar.isInventory = this.keysDown["i"] || this.sidebar.inventorySelected;
        if (!BARE) {
            this.sidebar.draw(this, interpolator);
        }
        this.ctx.translate(0, this.sideScroll);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, window.innerWidth, 56);
        this.ctx.fillRect(0, window.innerHeight - 56, window.innerWidth, 56);
        this.ctx.fillRect(0, 0, 9, window.innerHeight);
        this.ctx.fillRect(window.innerWidth - 56, 0, 56, window.innerHeight);
        this.drawStatus(interpolator);
        if (!this.minimalistic) {
            this.ctx.fillStyle = "black";
            this.ctx.beginPath();
            this.ctx.moveTo(window.innerWidth - 80, 56);
            this.ctx.quadraticCurveTo(window.innerWidth - 56, 56, window.innerWidth - 56, 80);
            this.ctx.lineTo(window.innerWidth - 56, 56);
            this.ctx.fill();
            this.ctx.moveTo(window.innerWidth - 80, window.innerHeight - 56);
            this.ctx.quadraticCurveTo(window.innerWidth - 56, window.innerHeight - 56, window.innerWidth - 56, window.innerHeight - 80);
            this.ctx.lineTo(window.innerWidth - 56, window.innerHeight - 56);
            this.ctx.fill();
            var offsetX = (this.cX - window.innerWidth/2) % MARKER_SPACING;
            var offsetY = (this.cY - window.innerHeight/2) % MARKER_SPACING;
            this.ctx.strokeStyle = "white";
            for (var i = 0; i < (window.innerWidth - 266 - 118) / MARKER_SPACING; i++) {
                var m_x = Math.round(MARKER_START_X + i * MARKER_SPACING - offsetX);
                this.ctx.beginPath();
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(m_x, 32);
                this.ctx.lineTo(m_x, 48);
                this.ctx.stroke();
                this.ctx.fillStyle = "#777";
                this.ctx.font = "8px 'Chakra Petch'";
                this.ctx.textAlign = "center";
                var tX = MARKER_START_X + i * MARKER_SPACING - offsetX;
                var pout = Math.round((tX - window.innerWidth/2 + this.cX)/MARKER_SPACING);
                this.ctx.fillText(pout, tX + MARKER_SPACING / 2, 46);
            }
            for (var i = 0; i < (window.innerHeight - 118 - 112) / MARKER_SPACING; i++) {
                var m_y = Math.round(MARKER_START_Y + i * MARKER_SPACING - offsetY);
                this.ctx.beginPath();
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(window.innerWidth - 32, m_y);
                this.ctx.lineTo(window.innerWidth - 48, m_y);
                this.ctx.stroke();
                this.ctx.fillStyle = "#777";
                this.ctx.font = "8px 'Chakra Petch'";
                this.ctx.textAlign = "left";
                var tY = MARKER_START_Y + i * MARKER_SPACING - offsetY;
                var pout = Math.round((tY - window.innerHeight/2 + this.cY)/MARKER_SPACING);
                this.ctx.fillText(pout, window.innerWidth - 46, tY + MARKER_SPACING / 2);
            }
        }
    }

    renderLoop() { // Is called as much as possible; draws things and does smooth rendering
        this.ctx.fillStyle = "rgb(0, 0, 25)";
        var interpolator = (window.performance.now() - this.status.lastTickTime) / this.status.tickTime;
        if (!INTERPOLATE) {
            interpolator = 1; // not 0, because then it'd be a frame behind at all times
        }
        if (interpolator > 1) { // if it's "glitching"
            //interpolator = 1;
        }
        if (this.status.isRTF && !this.status.moveShips && !this.status.wait) {
            this.cX = this.castle.getX(interpolator) * this.zoomLevel;
            this.cY = this.castle.getY(interpolator) * this.zoomLevel;
        }
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.renderGameboard(interpolator, this.zoomLevel);
        this.renderUI(interpolator);
        if (this.crt) {
            this.crt();
            //this.ctx.drawImage(document.getElementById("crt"), 0, 0);
        }
    }

    mouseFieldCheckOnOne(size, obj) {
        var bbox = obj.box;
        return this.gameX > bbox[0] - size && this.gameX < bbox[2] + size && this.gameY > bbox[1] - size && this.gameY < bbox[3] + size;
    }

    mouseFieldCheck(size) {
        var objects = Object.values(this.objects);
        for (var i = 0; i < objects.length; i++) {
            if (this.mouseFieldCheckOnOne(size, objects[i])) {
                return true;
            }
        }
        return false;
    }

    doMouse() {
        if (this.status.isRTF && this.accurateRTF && !this.status.moveShips) {
            var dX = this.mouseX - window.innerWidth / 2;
            var dY = this.mouseY - window.innerHeight/2;
            dX /= this.zoomLevel;
            dY /= this.zoomLevel;
            var magnitude = Math.sqrt(dX * dX + dY * dY);
            var angle = Math.atan2(dY, dX);
            angle += this.castle.a;
            this.gameX = this.castle.x + Math.cos(angle) * magnitude;
            this.gameY = this.castle.y + Math.sin(angle) * magnitude;
        }
        else {
            this.gameX = Math.round((this.cX + this.mouseX - window.innerWidth / 2)) / this.zoomLevel;
            this.gameY = Math.round((this.cY + this.mouseY - window.innerHeight / 2)) / this.zoomLevel;
        }
        this.gameX = Math.round(clamp(0, this.gameX, this.gamesize));
        this.gameY = Math.round(clamp(0, this.gameY, this.gamesize));
        this.status.mouseWithinNarrowField = this.mouseFieldCheck(400);
        this.status.mouseWithinWideField = this.mouseFieldCheck(600);
        if (this.castle) {
            this.status.canPlaceObject = this.mouseFieldCheckOnOne(800, this.castle);
            this.status.placeAroundFort = false;
            this.mine.forEach(id => {
                var item = this.objects[id];
                if (item == undefined) {
                    return;
                }
                if (item.type == "F") {
                    this.status.placeAroundFort |= this.mouseFieldCheckOnOne(400, item);
                }
            });
            this.status.canPlaceObject |= this.fortPlace();
            this.status.canPlaceObject &= this.status.moveShips || this.status.isRTF; // you can only place stuff during strat mode
            this.status.canPlaceObject |= this.superuser;
        }
    }

    interactionLoop() { // Is called as much as possible; handles interaction with the user
        var cTime = window.performance.now();
        this.status.FPS = 1000/(cTime - this.lastFrameTime);
        this.lastFrameTime = cTime;
        if (this.superuser) {
            this.status.score = Infinity;
        }
        this.doMouse();
        Object.values(this.objects).forEach((item) => {
            item.bodyHovered = (this.gameX > item.x         - 25 && this.gameX < item.x         + 25 && this.gameY > item.y         - 25 && this.gameY < item.y         + 25)
            item.isHovered = item.bodyHovered ||
                               (this.gameX > item.goalPos.x - 5  && this.gameX < item.goalPos.x + 5  && this.gameY > item.goalPos.y - 5  && this.gameY < item.goalPos.y + 5);
            item.interact(this);

            var dx = this.gameX - item.x;
            var dy = this.gameY - item.y;
            dx *= dx;
            dy *= dy;
            var d2 = dy + dx;

            if (this.status.isRTF && (item.type == "R" || item.type == "a") && item != this.castle) {
                if (d2 < 100 * 100) {
                    this.seeking = item;
                    this.seekTime = window.performance.now();
                }
            }
            if (this.seeking == item) {
                if (d2 > 1500 * 1500) {
                    this.seeking = undefined; // no more seekies!
                }
            }
        });

        this.controls.up = this.keysDown["ArrowUp"] || this.keysDown["w"];
        this.controls.down = this.keysDown["ArrowDown"] || this.keysDown["s"];
        this.controls.left = this.keysDown["ArrowLeft"] || this.keysDown["a"];
        this.controls.right = this.keysDown["ArrowRight"] || this.keysDown["d"];
        this.controls.shoot = this.keysDown["f"] ||  this.keysDown[" "];
        if (this.mousemodeRTF && this.status.isRTF) {
            if (this.mouseIsDown) {
                var dx = this.gameX - this.castle.x;
                var dy = this.gameY - this.castle.y;
                var mAngle = Math.atan2(dy, dx);
                var dist = Math.sqrt(dy * dy + dx * dx);
                var da = ringDist(mAngle, this.castle.a - Math.PI/2);
                if (dist < 20) { // hard brake
                    this.controls.down = true;
                }
                else {
                    if (dist < 100) { // precision turn
                        this.controls.down = true;
                    }
                    if (da < -Math.PI/8) {
                        this.controls.right = true;
                    }
                    if (da > Math.PI/8) {
                        this.controls.left = true;
                    }
                    if (dist > 200) {
                        this.controls.up = true;
                    }
                }
            }
            this.controls.shoot = this.rightMouse;
        }
        if (!this.status.isRTF || this.status.moveShips) {
            if (this.controls.up) {
                this.cY -= 40;
            }
            else if (this.controls.down) {
                this.cY += 40;
            }
            if (this.controls.left) {
                this.cX -= 40;
            }
            else if (this.controls.right) {
                this.cX += 40;
            }
        }
        this.cX = clamp(0, this.cX, this.gamesize * this.zoomLevel);
        this.cY = clamp(0, this.cY, this.gamesize * this.zoomLevel);
        this.sideScroll = clamp(0, this.sideScroll, this.sidebar.scrollHeight - window.innerHeight + 56)
        if (window.performance.now() - this.seekTime > 6000) {
            this.seeking = undefined;
        }
    }

    talk() { // Call every server tick; sends things to the server
        if (this.status.isRTF && !this.status.moveShips) {
            this.rtf(this.controls.up, this.controls.left, this.controls.right, this.controls.down, this.controls.shoot);
        }
    }

    tick() { // Runs every server tick
        this.talk();
        Object.values(this.objects).forEach((item) => {
            item.tick(this);
        });
    }

    connectionClosed() {

    }

    scroll(dx, dy) {
        if (this.keysDown["Shift"]) {
            var cache = dy;
            dy = dx;
            dx = cache;
        }
        if (this.mouseX < 266) {
            this.sideScroll += dy + dx;
        }
        else {
            this.cX += dx;
            this.cY += dy;
            this.cX = clamp(0, this.cX, this.gamesize);
            this.cY = clamp(0, this.cY, this.gamesize);
        }
    }

    mouse(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }

    mouseDown() {
        this.mouseIsDown = true;
    }

    rightMouseDown() {
        this.rightMouse = true;
    }

    rightMouseUp() {
        this.rightMouse = false;
    }

    place(type, variant = 0) {
        this.doPlace(this.gameX, this.gameY, type.charCodeAt(0), variant);
    }

    mouseUp() {
        this.mouseIsDown = false;
        if (this.mouseX < 266) { // It's in the sidebar
            this.sidebar.clickies(this);
        }
        else {
            if (this.status.hasPlacedCastle) {
                if (this.sidebar.inventorySelected && (this.status.moveShips || this.status.isRTF || this.superuser)) {
                    if (this.status.canPlaceObject || (this.sidebar.inventorySelected.place.word == "F" && !this.status.mouseWithinNarrowField)) {
                        if (this.sidebar.inventorySelected.place.word) {
                            this.place(this.sidebar.inventorySelected.place.word, this.sidebar.inventorySelected.place.activeVariant ? this.sidebar.inventorySelected.place.variants[this.sidebar.inventorySelected.place.activeVariant - 1].variantID : 0);
                            this.sidebar.inventorySelected.place.activeVariant = 0;
                        }
                        if (this.sidebar.inventorySelected.stack) {
                            this.sidebar.inventorySelected.stack--;
                        }
                        this.sidebar.inventorySelected = undefined;
                        this.inventory.forEach(item => {
                            item.selected = false;
                        });
                    }
                }
                else {
                    Object.values(this.objects).forEach(item => {
                        if (item.isOurs || this.superuser) {
                            item.click(this);
                        }
                    });
                }
            }
            else if (!this.status.mouseWithinNarrowField || this.superuser) {
                if (!this.status.spectating) {
                    this.place("c");
                    this.status.hasPlacedCastle = true;
                }
            }
        }
    }

    kill() {
        this.harikari = true;
    }

    enterMoveShips() {
        this.status.wallsRemaining = this.status.wallsTurn;
    }

    godDelete() {
        if (this.superuser) {
            Object.values(this.objects).forEach(obj => {
                if (obj.bodyHovered) {
                    this.doGodDelete(obj.id);
                }
            });
        }
    }

    godReset() { 
        if (this.superuser) {
            if (confirm("Really reset the server?")) {
                this.doGodReset();
            }
        }
    }

    godNuke() {
        if (this.superuser) {
            Object.values(this.objects).forEach(obj => {
                if (obj.bodyHovered) {
                    this.doGodNuke(obj.banner);
                }
            });
        }
    }

    godFlip() {
        if (this.superuser) {
            this.doGodFlip();
        }
    }

    godDisconnect() {
        if (this.superuser) {
            Object.values(this.objects).forEach(obj => {
                if (obj.bodyHovered) {
                    this.doGodDisconnect(obj.banner);
                }
            });
        }
    }

    godBless() {
        if (this.superuser) {
            Object.values(this.objects).forEach(obj => {
                if (obj.bodyHovered) {
                    this.doGodBless(obj.banner);
                }
            });
        }
    }
}


function screen(s) {
    Array.from(document.body.children).forEach(el => {
        if (el.id == s) {
            el.style.display = "";
        }
        else {
            el.style.display = "none";
        }
    });
}

screen("gameui");

var game = undefined;

async function play() {
    randomizeBanner();
    screen("establishin");
    var ws_url = document.getElementById("server-url").value;
    var manifest_url = document.getElementById("manifest-url").value;
    var started = false;
    var disconnect = () => {
        if (!started) {
            screen("failedToConnect");
            setTimeout(() => {
                screen("startscreen");
            }, 1000);
        }
        else {
            screen("disconnected");
            setTimeout(() => {
                window.location.reload(); // have to be aggressive; annoying event listeners will be stuck if we don't fully reload here.
            }, 1000);
        }
    };
    try {
        var connection = await protocolv3.connect(protocolv3.defaultConfig, ws_url, manifest_url, disconnect);
        connection.onOpen(() => {
            started = true;
            connection.sendHandle("SelfTest")(true, 100, 500, 892658726, -80000, 32.6416, "[EXPECT true, 100, 500, 892658726, -80000, 32.6416]");
            game = new Game(connection);
            var form = new FormData(document.getElementById("startform"));
            game.start(form);
            document.getElementById("game").addEventListener("wheel", (evt) => {
                game.scroll(evt.deltaX, evt.deltaY);
                evt.preventDefault();
                return false;
            }, {passive:false});

            document.getElementById("game").addEventListener("scroll", (evt) => {
                evt.preventDefault();
                return false;
            });

            window.addEventListener("mousemove", (evt) => {
                game.mouse(evt.clientX, evt.clientY);
            });

            document.getElementById("game").addEventListener("mousedown", (evt) => {
                if (evt.button == 0) {
                    game.mouseDown();
                }
                else {
                    game.rightMouseDown();
                }
            });

            document.getElementById("game").addEventListener("mouseup", (evt) => {
                if (evt.button == 0) {
                    game.mouseUp();
                }
                else {
                    game.rightMouseUp();
                }
            });

            window.addEventListener("keydown", (evt) => {
                if (game.mouseX > window.innerWidth - 400 && !document.getElementById("chat").classList.contains("hidden")) {
                    // TODO: use this for something or compress the statement into a single if.
                    // This trick of using an else instead of a not in anticipation of more code is
                    // something that has befuddled and annoyed people since my early robotics days.
                }
                else{
                    game.keysDown[evt.key] = true;
                    if (evt.key == "q") {
                        game.attemptWall(game.mouseX, game.mouseY);
                    }
                    else if (evt.key == "T") {
                        if (game.castle) { // you can't use the chat if you don't have a castle. this is also weak spectator discouragement, although it allows
                            // some harmless trolling.
                            document.getElementById("chat").classList.toggle("hidden");
                            document.getElementById("chat-banner").innerText = game.banners[game.castle.banner];
                        }
                    }
                }
            });

            window.addEventListener("keyup", (evt) => {
                if (game.mouseX > window.innerWidth - 400 && !document.getElementById("chat").classList.contains("hidden")) {
                    if (evt.key == "Enter") {
                        var chatdata = document.getElementById("chat-input").value;
                        game.chat(chatdata, chatdata[0] == "!");
                        document.getElementById("chat-input").value = "";
                    }
                }
                else{
                    game.keysDown[evt.key] = false;
                    if (evt.key == "i") {
                        game.sidebar.isInventory = !game.sidebar.isInventory;
                    }
                    if (evt.key == "Delete") {
                        game.godDelete();
                    }
                    if (evt.key == "D") {
                        game.godDisconnect();
                    }
                    if (evt.key == "R") {
                        game.godReset();
                    }
                    if (evt.key == "N") {
                        game.godNuke();
                    }
                    if (evt.key == "B") {
                        game.godBless();
                    }
                    if (evt.key == "F") { 
                        game.godFlip();
                    }
                    if (evt.key == "e" && game.status.isRTF) {
                        game.air2air();
                    }
                    if (evt.key == "r" && game.status.isRTF) {
                        game.accurateRTF = !game.accurateRTF;
                    }
                    if (!isNaN(evt.key)) {
                        var variant = evt.key - 0;
                        game.inventory.forEach(item => {
                            if (item.selected) {
                                if (item.place.variants[variant - 1]) {
                                    if (item.place.variants[variant - 1].eCost + item.cost <= game.status.score) {
                                        item.place.activeVariant = variant;
                                    }
                                    else {
                                        console.log("8=====D");
                                    }
                                }
                            }
                        });
                    }
                }
            });
        });
    }
    catch (e) {
        disconnect();
        console.log(e);
    }
}

function resizah() {
    var game = document.getElementById("game");
    game.width = window.innerWidth;
    game.height = window.innerHeight;
    var background = document.getElementById("background");
    if (diva) {
        background.width = divaW;
        background.height = divaH;
        background.style.display = "";
    }
    else{
        background.width = window.innerWidth;
        background.height = window.innerHeight;
    }
};

resizah();

window.addEventListener("resize", resizah);

function zeroes(num, size = 2) { 
    while (num.length < size) {
        num = "0" + num;
    }
    return num;
}

function guessWS() {
    var construct = "ws";
    if (window.location.protocol == "https:") {
        construct += "s";
    }
    construct += "://";
    construct += window.location.host + window.location.pathname;
    construct += "/game";
    return construct;
}


/* OPTIMIZATION:
    In the olden days, the client was constantly sending requests (usually MOVE) at every frame, or thereabouts!
    This is obviously unsuitable because my system updates at 120 hz, most systems update at 60hz, and the server updates at 30hz.
    *At best, the server was receiving updates twice as often as optimal*. This is bad, but it's even worse when you consider RTFs:
    they have to send a relatively sizeable broadcast at whatever framerate the system uses *just to be usable at all*.
    In effect, every game we played was ddosing my server.

    Gonna try to avoid that!
*/

if (localStorage.banner) {
    document.getElementById("banner").value = localStorage.banner;
}
else {
    randomizeBanner();
}

var bannerEl = document.getElementById("banner");
bannerEl.onchange = () => {
    localStorage.banner = document.getElementById("banner").value;
};


if (Notification.permission == "default") {
    screen("allownotifs");
}
else {
    screen("startscreen");
}

function allowNotifs() {
    Notification.requestPermission().then(() => {
        screen("startscreen");
    });
}

function prepCRT() {
    var gl = new BetterWGL(document.getElementById("crt"));
    gl.attachVertexShader(`#version 300 es
    in vec4 position;
    out vec2 graphix;

    void main() {
        gl_Position = position;
        graphix = (position.xy + vec2(1.0, 1.0)) / 2.0;
        graphix.y = 1.0 - graphix.y;
    }
    `);
    gl.attachFragmentShader(`#version 300 es
    precision highp float;
    out vec4 outColor;
    in vec2 graphix;
    uniform sampler2D image;
    uniform vec2 screenSize;
    uniform vec2 curvature;
    uniform vec2 scanlineStrength;

    vec2 curveRemapUV(vec2 uv) {
        uv = uv * 2.0 - 1.0;
        vec2 offset = abs(uv.yx) / vec2(curvature.x, curvature.y);
        uv = uv + uv * offset * offset;
        uv = uv * 0.5 + 0.5;
        return uv;
    }

    vec4 scanLine(float uv, float resolution, float opacity) {
        float PI = 3.141592;
        float intensity = sin(uv * resolution + PI * 2.0);
        intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
        return vec4(vec3(pow(intensity, opacity)), 1.0);
    }

    void main() {
        vec2 map = graphix;
        map = curveRemapUV(map);
        outColor = texture(image, map);
        outColor *= scanLine(map.x, screenSize.y, scanlineStrength.x);
        outColor *= scanLine(map.y, screenSize.x, scanlineStrength.y);
        float dX = (map.x - 0.5) * 2.0;
        float dY = (map.y - 0.5) * 2.0;
        float d = sqrt(dX * dX + dY * dY);
        d = pow(d, 5.0) * 0.2;
        outColor *= 1.0 - d;
        outColor.w = 1.0;
    }`);
    gl.setup();
    gl.uniformFloat("curvature", [ [4.0, 4.0] ]);
    gl.uniformFloat("scanlineStrength", [ [0.1, 0.1] ]);
    gl.resize(window.innerWidth, window.innerHeight);
    return () => {
        gl.uniformFloat("screenSize", [ [window.innerWidth, window.innerHeight] ]);
        gl.setTexture("image", document.getElementById("game"));
        gl.draw();
    };
}

// TODO: Move metaballs to Better WGL.