function ModalObj(id, actions) { 
    var modal = {};
    modal.id = id;
    modal.element = document.getElementById(id);
    function complete(modal, callback) {
        return (function () {
            modal.hide();
            callback(modal);
        });
    }
    if (modal.element == null) {
        console.log('ModalObj does not find id=[' + id + ']');
    } else
    if (typeof(actions) === 'undefined' || actions.length == 0) {
        initButton('-close', complete(modal, function (modal) {
            modal.hide();
        }));
    } else
    for (var i = 0; i < actions.length; i++) {
        initButton(actions[i].prefix, actions[i].method)
    }
    modal.hide = function () {
        modal.element.style.display = "none";
    }
    modal.show = function () {
        modal.element.style.display = "block";
    }
    function initButton(prefix, method) {
        try {
            var id = modal.id + prefix;
            console.log('ModalObj id=[' + id + ']');
            var span = document.getElementById(id);
            span.onclick = complete(modal, method);
        } catch (e) {
            console.log('ModalObj' + e.toString());
        }
    }
    return (modal);
}
