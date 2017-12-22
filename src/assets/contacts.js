var Contacts = null;
execute_ContactApp();
define(["require", "exports"], function(require, exports){
   exports.value = Contacts.contactname;
   exports.getContacts = function () {
        return (Contacts);
   }
   exports.getObjects = function () {
        return (Contacts.objects);
   }
   exports.getTemplate = function () {
        return (Contacts.template);
   }
   exports.getResults = function () {
        return (Contacts.results);
   }
   exports.initContacts = function (component) {
        initContacts(component);
   }
   exports.readSingleFile = function (obj, suffix) {
        readSingleFile(obj, suffix);
   }
});
var ContactManager = {
    test: '1234',
    getController: function () {
        return (Contacts);
    },
    DeviceType: false,
    isDevice: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log('DeviceType is set for device!')
            ContactManager.DeviceType = true;
        }
        return (ContactManager.DeviceType);
    },
    setToolTip: function () {
        if (ContactManager.DeviceType == false) {
            $('[data-toggle="tooltip"]').tooltip();
            $('[rel=tooltip]').tooltip({ trigger: "hover" });
            hideTooltips();
        }
    }
}
ContactManager.isDevice();
function execute_ContactApp() {
    Contacts = this;
//    Contacts.scope = $scope;
    Contacts.component = null;
    Contacts.contactname = '';
    Contacts.results = [];
    Contacts.savedvalues = null;
    Contacts.weburl = 'http://localhost:3333/';
    Contacts.Debug = 0;
    Contacts.update = function () {
//        Contacts.scope.$apply();
        Contacts.component.updateObjects(Contacts.component);
    }
    Contacts.getKey = function (obj) {
        return (obj.Name.replace(/\W+/g, "_"));
    }
    Contacts.exists = function (obj) {
        var ret = false;
        try {
            if (typeof(Contacts.hashmap[Contacts.getKey(obj)]) === 'undefined') {} else {
                ret = true;
            }
        } catch (e) {}
        return(ret);
    }
    Contacts.edit = function (obj) {
        console.log('edit obj=' + JSON.stringify(obj));
        obj.editclass = 'noshow';
        Contacts.savedvalues = JSON.parse(JSON.stringify(obj));
        toggleEdit(obj);
    }
    Contacts.refresh = function (obj) {
        toggleEdit(obj);
        console.log('saved=' + JSON.stringify(Contacts.savedvalues));
        try {
            if (Contacts.savedvalues == null) {} else
            if ( typeof (obj.Key) === 'undefined') {} else
            if ( typeof (Contacts.hashmap[obj.Key]) === 'undefined') {} else {
                obj = Contacts.hashmap[obj.Key];
                for(var k in Contacts.savedvalues) {
                    obj [k] = Contacts.savedvalues[k];
                }
                var done = true;
                do {
                    done = true;
                    for(var k in obj) {
                        if (typeof(Contacts.savedvalues[k]) === 'undefined') {
                            delete (obj[k]);
                            done = false;
                            break;
                        }
                    }
                } while (!done);
            }
            initImages(false);
        } catch (e) {
            console.log('refresh ' + e.toString());
        }
    }
    Contacts.sendData = function (data, success, failure) {
        if (Contacts.Debug < 1) { } else
        try {
            console.log('data=' + JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
        $.ajax({
            url: 'http://localhost:3333/private',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            success: success,
            error: function (xhr, textStatus, error) {
                var err = {};
                try {
                    err = eval("(" + xhr.responseText + ")");
                } catch (e) {}
                console.log('xhr=' + JSON.stringify(err));
                failure('Error[ ' + JSON.stringify(err) + ']');
            }
        });
    }
    Contacts.sendImage = function (data, success, failure) {
        if (Contacts.Debug < 1) { } else
        try {
            console.log('data=' + JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
        $.ajax({ 
            url: 'http://localhost:3333/images',
            type: 'POST',
            dataType: 'json',
            data: data,
            success: success,
            error: function (xhr, textStatus, error) {
                var err = eval("(" + xhr.responseText + ")");
                console.log('xhr=' + JSON.stringify(err));
                failure('Error[ ' + JSON.stringify(err) + ']');
            }
        });
    }
    Contacts.save = function (obj) {
        obj.operation = 'update';
        var image = obj.ProfileImage;
        if (typeof(image) === 'undefined') {} else {
            delete (obj.ProfileImage)
            image.filename = 'data/' + obj.Key + '.' + (new Date()).getTime() + '.jpg';
            obj.LargeImage = image.filename;
            obj.SmallImage = image.filename;
            sendFrags(image)();
            function sendFrags (image) {
                return (function () {
                    var frag = image.contents.pop();
                    if (frag == null) {} else {
                        Contacts.sendImage({
                                contents: [frag],
                                filename: image.filename
                            }, sendFrags({
                                contents: image.contents,
                                filename: image.filename
                            }),
                            function (msg) {
                                alert(msg);
                            }
                        );
                    }
                });
            }
        }
        Contacts.sendData(obj, function (data) {
            console.log('sendData response=' + JSON.stringify(data));
            if (data.status === 'Error') {
                alert(data.message);
            } else {
                console.log('save obj=' + JSON.stringify(obj));
                obj.editclass = 'show';
                toggleEdit(obj);
            }
            Contacts.update();
        }, function (msg) {
            alert(msg);
        });
    }
    Contacts.remove = function (obj) {
        Contacts.results = [];
        Contacts.results.push({
            name: 'Are you sure?',
            message: 'Undo is not implemented; [' + obj.Name + '] will be lost!'
        });
        var modalobj = ModalObj('Contacts-Modal', [{
                prefix: '-close',
                method: function (modal) {
                    //Contacts.results = [];
                }
            },{
                prefix: '-ok',
                method: complete(obj)
            }]
        );
        ContactManager.setToolTip();
        Contacts.update();
        modalobj.show();
        function complete (obj) {
            return (function () {
                //Contacts.results = [];
                console.log('remove obj=' + JSON.stringify(obj));
                obj.operation = 'delete';
                Contacts.sendData(obj, function (data) {
                    console.log('sendData response=' + JSON.stringify(data));
                    if (data.status === 'Error') {
                        alert(data.message);
                    } else {
                        console.log('remove post obj=' + JSON.stringify(obj));
                        for (var i = 0; i < Contacts.objects.length; i++) {
                            if (Contacts.objects[i].Key === obj.Key) {
                                Contacts.removeFromHashMap(obj);
                                Contacts.objects.splice(i, 1);
                                break;
                            }
                        }
                        Contacts.update();
                    }
                }, function (msg) {
                    alert(msg);
                });
            });
        }
    }
    Contacts.upload = function (obj, suffix) {
        //console.log('upload obj=' + JSON.stringify(obj));
        var tag = 'upload-' + obj.Key + suffix;
        var element = document.getElementById(tag);
        if (element == null) {
            alert('Cannot find ' + tag);
        } else {
            $(element).click();
        }
    }
    Contacts.create = function (contactname) {
        Contacts.contactname =contactname;
        console.log('create obj=[' + JSON.stringify(Contacts.contactname) + ']');
        var obj = {
            Name: Contacts.contactname,
            SmallImage: 'assets/nouserpic-50.png',
            LargeImage: 'assets/nouserpic-225.png',
            editclass: 'noshow',
            direction: 'up',
            operation: 'create'
        };
        toggleEdit(obj);
        obj.Key = Contacts.getKey(obj);
        if (Contacts.contactname.length <= 0) {
            alert('Name must be entered!');
        } else
        if (Contacts.exists(obj) == true) {
            alert('Name already exists!');
        } else {
            Contacts.sendData(obj, function (data) {
                console.log('sendData response=' + JSON.stringify(data));
                if (data.status === 'Error') {
                    alert(data.message);
                } else
                if (Contacts.addToHashMap(obj) == true) {
                    Contacts.objects.unshift(obj);
                    Contacts.contactname = '';
                    Contacts.update();
                    window.setTimeout(complete(obj), 0);
                    function complete(obj) {
                        var key = obj.Key;
                        return (function () {
                            try {
                                ContactManager.setToolTip();
                                $('#' + key).show();
                            } catch (e) {
                                console.log('create=' + e.toString());
                            }
                        });
                    }
                } else {
                    alert('Error, unable to save to local hash map!');
                }
            }, function (msg) {
                alert(msg);
            });
        }
    }
    Contacts.search = function () {
        console.log('search obj=[' + JSON.stringify(Contacts.contactname) + ']');
        alert('Search is not implemented; this would allow specific contact selection from the URI as well.')
    }
    Contacts.showWithKey = function (dataFor) {
        var idFor = $(dataFor);
        console.log('panelsButton' + JSON.stringify(dataFor));
        //current button
        idFor.slideToggle(400, function() {
        })
    }
    Contacts.show = function (obj) {
        //Contacts.showWithKey(obj.attr('data-for'));
    }
    Contacts.expand = function (obj) {
        console.log('expand=' + JSON.stringify(obj));
        var panels = $('.user-infos');
        if (typeof(obj.direction) === 'undefined') {
            obj.direction = 'up';
        } else
        if (obj.direction === 'up') {
            obj.direction = 'down';
        } else {
            obj.direction = 'up';
        }
        Contacts.showWithKey('#' + obj.Key);
    }
    Contacts.template = [
    {
        name: 'Phone',
        label: 'Phone number'
    },
    {
        name: 'Address',
        label: 'Postal address'
    },
    {
        name: 'Email',
        label: 'Email address'
    },
    {
        name: 'HomeDir',
        label: 'Home directory'
    },
    {
        name: 'Location',
        label: 'Office location'
    },
    {
        name: 'UserTitle',
        label: 'Role title'
    },
    {
        name: 'UserLevel',
        label: 'Role level'
    }
    ];
    Contacts.objects = [];
    Contacts.hashmap = [];
    Contacts.addToHashMap = function (obj) {
        var ret = false;
        if (Contacts.exists(obj) == true) {
        } else {
            obj.Key = Contacts.getKey(obj);
            Contacts.hashmap[obj.Key] = obj;
            ret = true;
        }
        return (ret);
    }
    Contacts.removeFromHashMap = function (obj) {
        try {
            delete (Contacts.hashmap[obj.Key]);
        } catch (e) {
            console.log('remove' + e.toString());
        }
    }
}

$(document).ready(function() {
    // window.setTimeout(initContacts, 0);
});

function initContacts(component) {
    Contacts.component = component;
    Contacts.sendData({
        operation: 'retrieve'
    }, function (data) {
        //console.log(JSON.stringify(data));
        Contacts.objects = data;
        Contacts.objects.forEach( function (obj) {
            obj.editclass = 'show';
            obj.direction = 'down';
            delete (obj['$$hashKey']);
            toggleEdit(obj);
            Contacts.addToHashMap(obj);
            try {
			    var tag = '#' + obj.Key;
			    console.log(tag);
			    $(tag).hide();
            } catch (e) {
                console.log(e.toString());
            }
        });
        Contacts.update();
        window.setTimeout(initImages, 0);
    }, function (err) {
        alert('Unable to retrieve contacts; ' + err);
        window.setTimeout(initContacts, 2000);
    });
}
function initImages(flag) {
    console.log('initImages ... z');
    ContactManager.setToolTip();
    $('button').click(function(e) {
        e.preventDefault();
    });
    var i = 0;
    try {
        test(document.getElementById('ContactManager'));
        if (typeof(flag) === 'undefined') {
            Contacts.update();
        }
    } catch (e) {
        console.log(e.toString());
    }
    function test(element) {
        i++;
        // console.log('i=' + i + ' nodeName=' + element.nodeName);
        for ( var n = 0; n < element.childNodes.length; n++) {
            test(element.childNodes[n]);
        }
        function getsrc(element, value) {
            var src = Contacts.weburl + 'assets/nouserpic-50.png';
            if (value == null) { } else {
                try {
                    var key = element.attr('id');
                    key = key.substring(0, key.lastIndexOf('-'));
                    var obj = Contacts.hashmap[key];
                    src = Contacts.weburl + obj[value]; //.replace('images', 'data');
                    console.log('value=[' + value + '] src=[' + src + ']');
                } catch (e) {
                    console.log('getsrc() ' + e.toString());
                }
            }
            return (src);
        }
        if (element.nodeName === 'IMG') {
            element.setAttribute('src', getsrc($(element), element.getAttribute('data-src')));
        }
    }
}

function toggleEdit(obj) {
    try {
        if (obj.editclass === 'show') {
            obj.editclass = 'noshow';
            obj.showclass = 'show';
            obj.loadclass = 'invisible';
        } else {
            obj.editclass = 'show';
            obj.showclass = 'noshow';
            obj.loadclass = 'visible';
        }
    } catch (e) {
        console.log('toggleEdit' + e.toString());
    }
    ContactManager.setToolTip();
}

function readSingleFile(obj, tag) {
    console.log('readSingleFile;');
    var element = document.getElementById('upload-' + obj.Key + tag);
    var file = element.files[0];
    if (!file) {
        return;
    }
    console.log('filename=[' + file + '] id=[' + element.id + ']');
    var key = obj.Key;
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        displayContents(contents,key);
    };
    reader.readAsDataURL(file);
    var treader = new FileReader();
    function onload (key, reader) {
        return (function(e) {
            var maxsize = 26214400;
            var size = 26214400;
            var obj = Contacts.hashmap[key];
            var contents = new Uint8Array(reader.result); //btoa(reader.result);
            console.log('contents.length=[' + contents.length + ']');
            if (typeof(obj) === 'undefined') {
                alert('Contact key is undefined!');
            } else 
            if (contents.length > maxsize) {
                alert('Image is too large to save! maximum size is [' + maxsize + ']');
            } else {
                obj.ProfileImage = {
                }
                obj.ProfileImage.contents = [];
                for (var i = 0; i < contents.length; i = i + size) {
                    if (contents.length - i < size) {
                        size = contents.length - i;
                    }
                    try {
                        function bufferToBase64(buf) {
                            var binstr = Array.prototype.map.call(buf, function (ch) {
                                return String.fromCharCode(ch);
                            }).join('');
                            return btoa(binstr);
                        }
                        var arr = null;
                        try {
                            arr = new Uint8Array(contents.slice(i, i + size));
                        } catch (e) {
                            arr = new Uint8Array(contents);
                        }
                        //var buffer = new Uint8Array(arr);
                        var b64encoded = bufferToBase64(arr);
                        obj.ProfileImage.contents.push(b64encoded);
                        console.log('Fragment length=[' + size + '] encoded=[' + b64encoded.length + ']');
                    } catch (e) {
                        alert('Image NOT saved; ' + e.toString());
                        delete (obj.ProfileImage);
                        break;
                    }
                }
            }
        });
    }
    treader.onload = onload(key, treader);
    //treader.readAsText(file);
    //treader.readAsBinaryString(file);
    treader.readAsArrayBuffer(file);
}

function displayContents(contents, key) {
    updatesrc('img-' + key);
    function updatesrc(tag) {
        var elements = document.getElementsByClassName(tag);
        console.log('display; tag=[' + tag + '] len=[' + elements.length + ']'); // contents=[' + contents + ']');
        for (var i = 0; i < elements.length; i++) {
            elements[i].setAttribute('src', contents);
        }
    }
    Contacts.update();
}

function hideTooltips () {
    try {
        var HasTooltip = $('.hastooltip');
        HasTooltip.on('click', function(e) {
        e.preventDefault();
        var isShowing = $(this).data('isShowing');
        HasTooltip.removeData('isShowing');
        if (isShowing !== 'true')
        {
            HasTooltip.not(this).tooltip('hide');
            $(this).data('isShowing', "true");
            $(this).tooltip('show');
        }
        else
        {
            $(this).tooltip('hide');
        }

        }).tooltip({
        animation: true,
        trigger: 'manual'
        });
    } catch (e) {
        console.log('hideToolTips ' + e.toString());
    }
}
