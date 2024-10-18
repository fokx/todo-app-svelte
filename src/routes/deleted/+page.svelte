<script>
    import Todo from "$lib/components/todo-list.svelte";
    import {liveQuery} from "dexie";
    import {dbDexie} from "$lib/db-dexie.js";

    let todoListDeleted = liveQuery(() =>
        dbDexie.todos.where({'deleted': 'true'}).toArray()
    );
</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="centered">

    <h2>Deleted TODOs:</h2>
    <hr>
    {#if $todoListDeleted}
        <Todo bind:todos={$todoListDeleted} isDeletedListPage={true}/>
    {:else }
        <p>---None---</p>
    {/if}
    <a href="/">Return to Main Page</a>

</div>
