<script>
    import {dbDexie} from "$lib/db-dexie.js";
    import {fade} from 'svelte/transition';

    let {
        todos = $bindable(),
        isDeletedListPage = false,
    } = $props();


    async function deleteTodo(index) {
        let should_delete = true;
        await dbDexie.todos.get({id: index}).then(function (result) {
            if (result.done !== 'true' && !window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?')) {
                should_delete = false;
            }
        });
        if (should_delete === true) {
            dbDexie.todos.filter(t => t.id === index).modify({deleted: 'true'});
        }
    }

    function updateDone(ev, index) {
        dbDexie.todos.update(index, {done: ev.target.checked.toString()});
    }

    async function editTodo(index) {
        // todoList.splice(index, 1);
        await dbDexie.todos.get({id: index}).then(function (result) {
            let new_text = prompt(`Change "${result.text}" to:`, result.text);
            if (new_text !== null && new_text !== '') {
                dbDexie.todos.update(index, {text: new_text});
            }
        });
    }

</script>

<ul class="todos">
    {#if todos}
        {#each todos as todo, index (todo.id)}
            <li transition:fade={{  duration: 100}}>
                {#if !isDeletedListPage}
                    <input checked={todo.done === 'true'} onclick={(ev) => updateDone(ev, todo.id)} type="checkbox"/>
                {/if}
                <span class:checked={todo.done === 'true'}>{todo.text}</span>
                {#if !isDeletedListPage}
                    <button class="remove-button" onclick={() => deleteTodo(todo.id)}>Remove</button>
                    <button class="edit-button" onclick={() => editTodo(todo.id)}>Edit</button>
                {/if}
                <br/>
            </li>
        {/each}
    {/if}
</ul>
